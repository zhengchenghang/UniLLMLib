import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Tag,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { instancesApi } from '../api/instances';
import { templatesApi } from '../api/templates';
import { ConfigInstance, ConfigTemplate } from '../types';
import InstanceModal from '../components/InstanceModal';

const { Title } = Typography;

function InstancesPage() {
  const [instances, setInstances] = useState<ConfigInstance[]>([]);
  const [templates, setTemplates] = useState<ConfigTemplate[]>([]);
  const [currentInstance, setCurrentInstance] = useState<ConfigInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInstance, setEditingInstance] = useState<ConfigInstance | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instancesData, templatesData, currentData] = await Promise.all([
        instancesApi.list(),
        templatesApi.list(),
        instancesApi.getCurrent(),
      ]);
      setInstances(instancesData);
      setTemplates(templatesData);
      setCurrentInstance(currentData);
    } catch (error) {
      message.error('加载数据失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingInstance(null);
    setModalVisible(true);
  };

  const handleEdit = (instance: ConfigInstance) => {
    setEditingInstance(instance);
    setModalVisible(true);
  };

  const handleDelete = async (instanceId: string) => {
    try {
      await instancesApi.delete(instanceId);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败：' + (error as Error).message);
    }
  };

  const handleSelect = async (instanceId: string) => {
    try {
      await instancesApi.select(instanceId);
      message.success('切换成功');
      loadData();
    } catch (error) {
      message.error('切换失败：' + (error as Error).message);
    }
  };

  const handleModalOk = async (values: any) => {
    try {
      if (editingInstance) {
        await instancesApi.update(editingInstance.id, values);
        message.success('更新成功');
      } else {
        await instancesApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error((editingInstance ? '更新' : '创建') + '失败：' + (error as Error).message);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ConfigInstance) => (
        <Space>
          {text}
          {record.isDefault && <Tag color="blue">默认</Tag>}
          {currentInstance?.id === record.id && (
            <Tag icon={<CheckCircleOutlined />} color="success">
              当前
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '模板',
      dataIndex: 'templateId',
      key: 'templateId',
      render: (templateId: string) => {
        const template = templates.find((t) => t.id === templateId);
        return template?.name || templateId;
      },
    },
    {
      title: '选中模型',
      dataIndex: 'selectedModelId',
      key: 'selectedModelId',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ConfigInstance) => (
        <Space>
          {currentInstance?.id !== record.id && (
            <Button
              type="link"
              size="small"
              onClick={() => handleSelect(record.id)}
            >
              设为当前
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {!record.isDefault && (
            <Popconfirm
              title="确定要删除这个实例吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Title level={3}>配置实例管理</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建实例
          </Button>
        }
      >
        <Table
          dataSource={instances}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <InstanceModal
        visible={modalVisible}
        instance={editingInstance}
        templates={templates}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
}

export default InstancesPage;
