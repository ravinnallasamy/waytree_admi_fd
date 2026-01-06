import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    MessageSquare,
    TrendingUp,
    CheckCircle,
    Clock,
    Activity,
    MapPin,
    AlertCircle
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    PieChart, Pie
} from 'recharts';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const DashboardOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch real data from the backend
                const response = await api.get('/api/dashboard/stats');

                if (response && response.data) {
                    setStats(response.data);
                } else {
                    // Fallback or error if data structure is unexpected
                    setError("No data received");
                }
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer ${onClick ? 'hover:scale-[1.02]' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
            <div className="text-3xl font-black text-gray-900">{value?.toLocaleString() || 0}</div>
            {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50 h-screen">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50 h-screen">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Prepare Chart Data
    const growthData = stats?.charts?.userGrowth?.map(item => ({
        name: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: item.count
    })) || [];

    const activityComparisonData = [
        { name: 'Events', count: stats?.counts?.events || 0, fill: '#EC4899' },
        { name: 'Communities', count: stats?.counts?.communities || 0, fill: '#F59E0B' },
        { name: 'Connections', count: stats?.counts?.connections || 0, fill: '#4F46E5' },
    ];

    const verificationData = stats?.charts?.verificationStatus || [];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="flex-1 p-8 md:p-10 bg-gray-50/50 overflow-y-auto">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium mt-1">Real-time insights and platform activity.</p>
                </div>
                <div className="flex gap-2 text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 shadow-sm">
                    <Clock size={14} /> Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Users"
                    value={stats.counts.users}
                    icon={Users}
                    color="bg-indigo-600"
                    subtitle={`${stats.counts.newUsersToday} new today • ${stats.counts.blockedUsers} blocked`}
                    onClick={() => navigate('/admin/users?type=user')}
                />
                <StatCard
                    title="Active Events"
                    value={stats.counts.activeEvents}
                    icon={Calendar}
                    color="bg-pink-500"
                    subtitle={`${stats.counts.pendingEvents} pending verification`}
                    onClick={() => navigate('/admin/circles?type=event')}
                />
                <StatCard
                    title="Active Communities"
                    value={stats.counts.activeCommunities}
                    icon={MessageSquare}
                    color="bg-amber-500"
                    subtitle={`${stats.counts.pendingCommunities} pending verification`}
                    onClick={() => navigate('/admin/circles?type=community')}
                />
                <StatCard
                    title="Pending Reviews"
                    value={stats.counts.totalPendingReviews}
                    icon={Clock}
                    color="bg-teal-500"
                    subtitle="Events, Communities & Codes"
                    onClick={() => navigate('/admin/approvals')}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">

                {/* User Growth Chart - Spans 2 cols */}
                <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-gray-900">User Growth Trend</h2>
                        <p className="text-sm text-gray-400 font-medium">New registrations over the last 30 days</p>
                    </div>
                    <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
                        {growthData && growthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} minTickGap={30} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                Not enough data to display chart
                            </div>
                        )}

                    </div>
                </div>

                {/* Right Column Stack */}
                <div className="space-y-8">
                    {/* Breakdown Pie Chart */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Platform Content</h2>
                        <div style={{ width: '100%', height: '200px', minHeight: '200px' }}>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={activityComparisonData} layout="vertical" barSize={20}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {activityComparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Verification Status */}
                    {verificationData.length > 0 && (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Content Status</h3>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Verified ({verificationData[0]?.value || 0})
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending ({verificationData[1]?.value || 0})
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '96px', height: '96px', minWidth: '96px', minHeight: '96px' }}>
                                <ResponsiveContainer width={96} height={96}>
                                    <PieChart>
                                        <Pie
                                            data={verificationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0}
                                            outerRadius={40}
                                            fill="#8884d8"
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            <Cell fill="#10B981" />
                                            <Cell fill="#F59E0B" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Recent Signups */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900">Recent Users</h2>
                        <button onClick={() => navigate('/admin/users')} className="text-indigo-600 text-xs font-bold uppercase hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">View All</button>
                    </div>
                    <div className="space-y-4">
                        {stats.lists.recentSignups?.map((user, i) => (
                            <div key={user._id || i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden">
                                    {user.photoUrl ? (
                                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-600 font-bold text-xs">{user.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.role || 'User'} • {user.location || 'Unknown'}</p>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {(!stats.lists.recentSignups || stats.lists.recentSignups.length === 0) && (
                            <p className="text-center text-gray-400 text-sm py-4">No recent signups</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900">Upcoming Events</h2>
                        <button onClick={() => navigate('/admin/circles?type=event')} className="text-pink-600 text-xs font-bold uppercase hover:bg-pink-50 px-3 py-1 rounded-lg transition-colors">View All</button>
                    </div>
                    <div className="space-y-4">
                        {stats.lists.upcomingEvents?.map((event, i) => (
                            <div key={event._id || i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border-l-4 border-l-pink-500 bg-pink-50/20">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{event.name}</p>
                                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                        <MapPin size={10} /> {event.location}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-900">{new Date(event.dateTime).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        {(!stats.lists.upcomingEvents || stats.lists.upcomingEvents.length === 0) && (
                            <p className="text-center text-gray-400 text-sm py-4">No upcoming events scheduled</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => navigate('/create-event/new')} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-lg shadow-indigo-200 cursor-pointer hover:scale-[1.02] transition-transform">
                    <h3 className="text-2xl font-black mb-2">Create Event</h3>
                    <p className="text-indigo-100 mb-6 text-sm">Launch a new event or community instantly.</p>
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100">
                        Get Started <TrendingUp size={14} />
                    </div>
                </div>
                <div onClick={() => navigate('/admin/approvals')} className="bg-gradient-to-br from-pink-500 to-rose-500 p-8 rounded-3xl text-white shadow-lg shadow-pink-200 cursor-pointer hover:scale-[1.02] transition-transform">
                    <h3 className="text-2xl font-black mb-2">Review Requests</h3>
                    <p className="text-pink-100 mb-6 text-sm">{stats.counts.totalPendingReviews} items need your attention right now.</p>
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100">
                        Review Now <CheckCircle size={14} />
                    </div>
                </div>
                <div onClick={() => navigate('/admin/users')} className="bg-gradient-to-br from-emerald-500 to-teal-500 p-8 rounded-3xl text-white shadow-lg shadow-emerald-200 cursor-pointer hover:scale-[1.02] transition-transform">
                    <h3 className="text-2xl font-black mb-2">Manage Users</h3>
                    <p className="text-emerald-100 mb-6 text-sm">Update profiles, roles, and permissions.</p>
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100">
                        Go to Users <Users size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
