import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, Collapse } from 'antd';
import { ConfigInstance, ConfigTemplate } from '../types';
import { modelsApi } from '../api/models';

interface InstanceModalProps {
  visible: boolean;
  instance: ConfigInstance | null;
  templates: ConfigTemplate[];
  onOk: (values: any) => void;
  onCancel: () => void;
}

function InstanceModal({ visible, instance, templates, onOk, onCancel }: InstanceModalProps) {
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigTemplate | null>(null);
  const [allModels, setAllModels] = useState<any[]>([]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await modelsApi.list();
        setAllModels(models);
      } catch (error) {
        message.error('加载模型列表失败');
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (visible) {
      if (instance) {
        const template = templates.find((t) => t.id === instance.templateId);
        setSelectedTemplate(template || null);
        form.setFieldsValue({
          templateId: instance.templateId,
          name: instance.name,
          selectedModelId: instance.selectedModelId,
          ...instance.config,
        });
      } else {
        form.resetFields();
        setSelectedTemplate(null);
      }
    }
  }, [visible, instance, templates, form]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);
    if (template && template.modelIds.length > 0) {
      form.setFieldValue('selectedModelId', template.modelIds[0]);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { templateId, name, selectedModelId, ...rest } = values;

      const secrets: Record<string, string> = {};
      const config: Record<string, any> = {};

      if (selectedTemplate) {
        for (const field of selectedTemplate.secretFields) {
          if (rest[field.key] !== undefined && rest[field.key] !== '') {
            secrets[field.key] = rest[field.key];
            delete rest[field.key];
          }
        }
      }

      Object.assign(config, rest);

      const payload: any = {
        name,
        selectedModelId,
        config,
      };

      if (Object.keys(secrets).length > 0) {
        payload.secrets = secrets;
      }

      if (!instance) {
        payload.templateId = templateId;
      }

      onOk(payload);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const availableModels = selectedTemplate
    ? allModels.filter((m) => selectedTemplate.modelIds.includes(m.id))
    : [];

  return (
    <Modal
      title={instance ? '编辑实例' : '创建实例'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        {!instance && (
          <Form.Item
            name="templateId"
            label="配置模板"
            rules={[{ required: true, message: '请选择配置模板' }]}
          >
            <Select
              placeholder="选择配置模板"
              onChange={handleTemplateChange}
              options={templates.map((t) => ({
                label: t.name,
                value: t.id,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label="实例名称"
          rules={[{ required: true, message: '请输入实例名称' }]}
        >
          <Input placeholder="输入实例名称" />
        </Form.Item>

        <Form.Item
          name="selectedModelId"
          label="选择模型"
          rules={[{ required: true, message: '请选择模型' }]}
        >
          <Select
            placeholder="选择模型"
            disabled={!selectedTemplate}
            options={availableModels.map((m) => ({
              label: `${m.name} (${m.id})`,
              value: m.id,
            }))}
          />
        </Form.Item>

        {selectedTemplate && selectedTemplate.secretFields.length > 0 && (
          <Collapse
            items={[
              {
                key: 'secrets',
                label: '密钥配置',
                children: (
                  <>
                    {selectedTemplate.secretFields.map((field) => (
                      <Form.Item
                        key={field.key}
                        name={field.key}
                        label={field.label}
                        rules={[
                          {
                            required: !instance && field.required,
                            message: `请输入${field.label}`,
                          },
                        ]}
                        extra={field.description}
                      >
                        <Input.Password
                          placeholder={
                            instance
                              ? '留空表示不修改'
                              : `输入${field.label}`
                          }
                        />
                      </Form.Item>
                    ))}
                  </>
                ),
              },
            ]}
          />
        )}

        {selectedTemplate && selectedTemplate.configFields.length > 0 && (
          <Collapse
            items={[
              {
                key: 'config',
                label: '高级配置',
                children: (
                  <>
                    {selectedTemplate.configFields.map((field) => (
                      <Form.Item
                        key={field.key}
                        name={field.key}
                        label={field.label}
                        rules={[
                          {
                            required: field.required,
                            message: `请输入${field.label}`,
                          },
                        ]}
                        extra={field.description}
                      >
                        <Input placeholder={`输入${field.label}`} />
                      </Form.Item>
                    ))}
                  </>
                ),
              },
            ]}
            defaultActiveKey={[]}
          />
        )}
      </Form>
    </Modal>
  );
}

export default InstanceModal;
