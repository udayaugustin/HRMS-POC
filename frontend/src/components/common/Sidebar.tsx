import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountTree as FlowIcon,
  Event as LeaveIcon,
  CheckCircle as ApprovalIcon,
  ExpandLess,
  ExpandMore,
  Business as DepartmentIcon,
  LocationOn as LocationIcon,
  Work as DesignationIcon,
  Description as FormIcon,
  Policy as PolicyIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;

interface MenuItemType {
  title: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItemType[];
  roles?: string[];
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});

  const handleToggle = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Check if user has access to menu item
  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.some((role) => hasRole(role));
  };

  const adminMenuItems: MenuItemType[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
    },
    {
      title: 'Employees',
      icon: <PeopleIcon />,
      children: [
        { title: 'Employee List', icon: <PeopleIcon />, path: '/admin/employees' },
        { title: 'Add Employee', icon: <PeopleIcon />, path: '/admin/employees/new' },
        { title: 'Departments', icon: <DepartmentIcon />, path: '/admin/departments' },
        { title: 'Designations', icon: <DesignationIcon />, path: '/admin/designations' },
        { title: 'Locations', icon: <LocationIcon />, path: '/admin/locations' },
      ],
    },
    {
      title: 'Workflows',
      icon: <FlowIcon />,
      children: [
        { title: 'Flow Definitions', icon: <FlowIcon />, path: '/admin/flows' },
        { title: 'Form Schemas', icon: <FormIcon />, path: '/admin/form-schemas' },
        { title: 'Policies', icon: <PolicyIcon />, path: '/admin/policies' },
      ],
    },
    {
      title: 'Approvals',
      icon: <ApprovalIcon />,
      path: '/admin/approvals',
    },
    {
      title: 'Leave Management',
      icon: <LeaveIcon />,
      children: [
        { title: 'Leave Types', icon: <LeaveIcon />, path: '/admin/leave-types' },
        { title: 'Leave Requests', icon: <LeaveIcon />, path: '/admin/leave-requests' },
      ],
    },
  ];

  const userMenuItems: MenuItemType[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/user/dashboard',
    },
    {
      title: 'My Leave',
      icon: <LeaveIcon />,
      children: [
        { title: 'Leave Balance', icon: <LeaveIcon />, path: '/user/leave/balance' },
        { title: 'Apply Leave', icon: <LeaveIcon />, path: '/user/leave/apply' },
        { title: 'Leave History', icon: <LeaveIcon />, path: '/user/leave/history' },
      ],
    },
    {
      title: 'My Approvals',
      icon: <ApprovalIcon />,
      path: '/user/approvals',
    },
  ];

  // Determine which menu to show based on current path
  const isAdminPath = location.pathname.startsWith('/admin');
  const menuItems = isAdminPath ? adminMenuItems : userMenuItems;

  const renderMenuItem = (item: MenuItemType, level: number = 0) => {
    if (!hasAccess(item.roles)) {
      return null;
    }

    const isActive = item.path === location.pathname;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.title];

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: 2.5,
              pl: level * 2 + 2.5,
              bgcolor: isActive ? 'primary.light' : 'transparent',
              '&:hover': {
                bgcolor: isActive ? 'primary.light' : 'action.hover',
              },
            }}
            onClick={() => {
              if (hasChildren) {
                handleToggle(item.title);
              } else if (item.path) {
                handleNavigate(item.path);
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: isActive ? 'primary.contrastText' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                color: isActive ? 'primary.contrastText' : 'inherit',
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>{menuItems.map((item) => renderMenuItem(item))}</List>
    </Drawer>
  );
};

export default Sidebar;
