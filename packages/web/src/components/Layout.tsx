import { Layout as AntLayout, Menu, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DatabaseOutlined, MessageOutlined } from '@ant-design/icons';

const { Header, Content } = AntLayout;

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/instances',
      icon: <DatabaseOutlined />,
      label: '配置管理',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: '聊天',
    },
  ];

  return (
    <AntLayout style={{ height: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: colorBgContainer,
          padding: '0 20px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '40px' }}>
          UniLLM 管理控制台
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, border: 'none' }}
        />
      </Header>
      <Content style={{ padding: '24px', overflow: 'auto' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
}

export default Layout;
