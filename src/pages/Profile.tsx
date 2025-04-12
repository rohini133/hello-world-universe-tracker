
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Building, AlertCircle, Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { userName, userRole } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Mock user data - in a real app, this would come from API/context
  const [userData, setUserData] = useState({
    fullName: userName || "Demo User",
    email: "user@example.com",
    phone: "+91 98765 43210",
    role: userRole || "admin",
    address: "123 Street, City, State",
    avatar: "/lovable-uploads/59cca976-e10d-409f-b661-124e886e72b7.png" // Use the uploaded image
  });
  
  // Profile update form state
  const [profileForm, setProfileForm] = useState({
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    address: userData.address
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    salesAlerts: true,
    stockAlerts: true,
    loginAlerts: false
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the profile
    setUserData({
      ...userData,
      fullName: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
      address: profileForm.address
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would call an API to update the password
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    
    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call an API to update notification settings
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  return (
    <PageContainer title="User Profile" subtitle="Manage your account information and settings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar} alt={userData.fullName} />
                  <AvatarFallback className="text-2xl">{userData.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{userData.fullName}</h3>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {userData.role === "admin" ? "Administrator" : "Cashier"}
                    </span>
                  </div>
                </div>
                
                <div className="w-full">
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile Information
                  </Button>
                  <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab("security")}>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                  <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab("notifications")}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            id="fullName"
                            className="pl-10"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            id="email"
                            type="email"
                            className="pl-10"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            id="phone"
                            className="pl-10"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            id="address"
                            className="pl-10"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="mt-4">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      />
                    </div>
                    
                    <Button type="submit" className="mt-4">Change Password</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive system notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">SMS Notifications</h4>
                          <p className="text-sm text-gray-500">Receive system notifications via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: e.target.checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Sales Alerts</h4>
                          <p className="text-sm text-gray-500">Get notified about sales activity</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={notificationSettings.salesAlerts}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            salesAlerts: e.target.checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Stock Alerts</h4>
                          <p className="text-sm text-gray-500">Get notified about low stock items</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={notificationSettings.stockAlerts}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            stockAlerts: e.target.checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Login Alerts</h4>
                          <p className="text-sm text-gray-500">Get notified about new login activities</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={notificationSettings.loginAlerts}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            loginAlerts: e.target.checked
                          })}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="mt-4">Save Preferences</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
};

export default Profile;
