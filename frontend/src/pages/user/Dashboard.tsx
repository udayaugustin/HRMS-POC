import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Event as LeaveIcon,
  CheckCircle as ApprovalIcon,
  CalendarToday as UpcomingIcon,
} from '@mui/icons-material';
import type { UserDashboardStats } from '../../types';
import { dashboardService } from '../../services/dashboard.service';
import Loading from '../../components/common/Loading';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await dashboardService.getUserStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const calculateUsagePercentage = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        My Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Leave Balances */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <LeaveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Leave Balance
            </Typography>
            {stats.leaveBalances.map((balance) => (
              <Box key={balance.id} sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1" fontWeight={500}>
                    {balance.leaveType?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {balance.availableDays} / {balance.totalDays} days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateUsagePercentage(balance.usedDays, balance.totalDays)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor:
                        calculateUsagePercentage(balance.usedDays, balance.totalDays) > 80
                          ? 'error.main'
                          : 'primary.main',
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Used: {balance.usedDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending: {balance.pendingDays}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {stats.pendingApprovals.length}
                      </Typography>
                      <Typography variant="body2">Pending Approvals</Typography>
                    </Box>
                    <ApprovalIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {stats.upcomingLeaves.length}
                      </Typography>
                      <Typography variant="body2">Upcoming Leaves</Typography>
                    </Box>
                    <UpcomingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Leave Requests */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <LeaveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Leave Requests
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentLeaveRequests.slice(0, 5).map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.leaveType?.name}</TableCell>
                      <TableCell>
                        {new Date(leave.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{leave.numberOfDays}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          color={getStatusColor(leave.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.recentLeaveRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No leave requests yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
