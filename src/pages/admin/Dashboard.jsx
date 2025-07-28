import { Users, BookOpen, Clock, MessageSquare, ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import AdminLayout from "../../components/admin/AdminLayout";

// Mock data - replace with actual data from your API
const stats = [
  { name: 'Total Users', value: '2,345', icon: Users, change: '+12.1%', changeType: 'increase' },
  { name: 'Active Sessions', value: '1,234', icon: Activity, change: '+5.7%', changeType: 'increase' },
  { name: 'Total Stories', value: '845', icon: BookOpen, change: '-2.3%', changeType: 'decrease' },
  { name: 'Messages', value: '128', icon: MessageSquare, change: '+8.2%', changeType: 'increase' },
];

const recentActivity = [
  { id: 1, user: 'Alex Johnson', action: 'created a new story', time: '5 min ago' },
  { id: 2, user: 'Sam Wilson', action: 'updated profile settings', time: '12 min ago' },
  { id: 3, user: 'Taylor Swift', action: 'published a new chapter', time: '25 min ago' },
  { id: 4, user: 'Chris Evans', action: 'commented on a story', time: '42 min ago' },
  { id: 5, user: 'Emma Stone', action: 'started following you', time: '1 hour ago' },
];

const quickActions = [
  { name: 'Create New Story', icon: BookOpen, href: '#' },
  { name: 'Manage Users', icon: Users, href: '#' },
  { name: 'View Analytics', icon: TrendingUp, href: '#' },
  { name: 'Check Messages', icon: MessageSquare, href: '#' },
];

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your Storyline admin panel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.changeType === 'increase' ? '↑' : '↓'} {stat.change}
                </span>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Updated 2 minutes ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user} <span className="text-gray-500 font-normal">{activity.action}</span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all activity <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                {quickActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.href}
                    className="group flex items-center p-3 -m-3 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                      <action.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">{action.name}</p>
                    </div>
                    <div className="ml-auto">
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="mt-6 bg-white shadow rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">System Status</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Server Load</span>
                      <span className="font-medium text-gray-900">24%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Database</span>
                      <span className="font-medium text-gray-900">1.2GB / 10GB</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Uptime</span>
                      <span className="font-medium text-gray-900">99.98%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99.98%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">Last updated: Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
