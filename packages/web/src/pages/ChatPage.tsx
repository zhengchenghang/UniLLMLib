import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  message,
  Select,
  Typography,
  List,
  Avatar,
  Spin,
  Alert,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { instancesApi } from '../api/instances';
import { chatApi, ChatRequest } from '../api/chat';
import { ConfigInstance, ChatMessage } from '../types';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

function ChatPage() {
  const [instances, setInstances] = useState<ConfigInstance[]>([]);
  const [currentInstance, setCurrentInstance] = useState<ConfigInstance | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInstances = async () => {
    try {
      const [instancesData, currentData] = await Promise.all([
        instancesApi.list(),
        instancesApi.getCurrent(),
      ]);
      setInstances(instancesData);
      setCurrentInstance(currentData);
      if (currentData) {
        setSelectedInstanceId(currentData.id);
      }
    } catch (error) {
      message.error('加载实例失败：' + (error as Error).message);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const handleInstanceChange = async (instanceId: string) => {
    try {
      await instancesApi.select(instanceId);
      setSelectedInstanceId(instanceId);
      const updated = await instancesApi.getCurrent();
      setCurrentInstance(updated);
      message.success('切换实例成功');
    } catch (error) {
      message.error('切换实例失败：' + (error as Error).message);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      message.warning('请输入消息');
      return;
    }

    if (!currentInstance || !currentInstance.selectedModelId) {
      message.error('请先选择实例和模型');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreaming(true);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
    };
    setMessages([...newMessages, assistantMessage]);

    const request: ChatRequest = {
      model: currentInstance.selectedModelId,
      messages: newMessages,
    };

    try {
      await chatApi.sendStream(
        request,
        (chunk: string) => {
          assistantMessage.content += chunk;
          setMessages([...newMessages, { ...assistantMessage }]);
        },
        () => {
          setLoading(false);
          setStreaming(false);
        },
        (error: Error) => {
          message.error('发送失败：' + error.message);
          setMessages(newMessages);
          setLoading(false);
          setStreaming(false);
        }
      );
    } catch (error) {
      message.error('发送失败：' + (error as Error).message);
      setMessages(newMessages);
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div style={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
      <Card
        title={<Title level={3}>聊天</Title>}
        extra={
          <Space>
            <Select
              style={{ width: 300 }}
              placeholder="选择实例"
              value={selectedInstanceId}
              onChange={handleInstanceChange}
              options={instances.map((inst) => ({
                label: `${inst.name} (${inst.selectedModelId})`,
                value: inst.id,
              }))}
            />
            <Button danger icon={<DeleteOutlined />} onClick={handleClear}>
              清空对话
            </Button>
          </Space>
        }
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {!currentInstance && (
          <Alert
            message="请先选择一个实例"
            description="需要先创建并选择一个配置实例才能开始聊天"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            marginBottom: 16,
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#fafafa',
          }}
        >
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item
                style={{
                  border: 'none',
                  padding: '12px 0',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a',
                      }}
                    />
                  }
                  title={msg.role === 'user' ? '你' : 'AI 助手'}
                  description={
                    <Paragraph
                      style={{
                        whiteSpace: 'pre-wrap',
                        marginBottom: 0,
                      }}
                    >
                      {msg.content || (streaming ? <Spin size="small" /> : '')}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading || !currentInstance}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!currentInstance}
          >
            发送
          </Button>
        </Space.Compact>
      </Card>
    </div>
  );
}

export default ChatPage;
