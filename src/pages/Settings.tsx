
import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Settings as SettingsIcon, Database, Globe, Printer, CreditCard, Lock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const { darkMode, setDarkMode } = useTheme();
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "Vivaas",
    storeAddress: "804, Ravivar Peth, Kapad Ganj, Opp. Shani Mandir, Pune - 411002",
    storePhone: "+91 98906 69994",
    storeEmail: "info@vivaas.com",
    currency: "INR",
    language: "en",
    timeZone: "Asia/Kolkata",
    darkMode: false
  });

  // Update local state when theme context changes
  useEffect(() => {
    setGeneralSettings(prev => ({
      ...prev,
      darkMode
    }));
  }, [darkMode]);
  
  // Receipt settings
  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showStoreInfo: true,
    showTaxInfo: true,
    footerText: "Thank you for shopping with us!",
    printAutomatically: false,
    sendReceiptEmail: true,
    sendReceiptSMS: false
  });
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptDigitalWallet: true,
    defaultPaymentMethod: "cash",
    taxPercentage: 18,
    enableDiscount: true
  });
  
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    dataRetentionPeriod: 12,
    allowOfflineMode: true,
    requirePasswordForRefunds: true,
    lowStockThreshold: 5
  });
  
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the dark mode in the theme context
    setDarkMode(generalSettings.darkMode);
    
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully.",
    });
  };
  
  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Receipt settings have been updated successfully.",
    });
  };
  
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Payment settings have been updated successfully.",
    });
  };
  
  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setGeneralSettings({...generalSettings, darkMode: checked});
    setDarkMode(checked);
  };
  
  return (
    <PageContainer title="Settings" subtitle="Configure system preferences and options">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button 
                  variant={activeTab === "general" ? "default" : "outline"} 
                  className="w-full justify-start dark:border-gray-600 dark:text-white dark:hover:bg-gray-700" 
                  onClick={() => setActiveTab("general")}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  General
                </Button>
                
                <Button 
                  variant={activeTab === "receipt" ? "default" : "outline"} 
                  className="w-full justify-start dark:border-gray-600 dark:text-white dark:hover:bg-gray-700" 
                  onClick={() => setActiveTab("receipt")}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Receipts
                </Button>
                
                <Button 
                  variant={activeTab === "payment" ? "default" : "outline"} 
                  className="w-full justify-start dark:border-gray-600 dark:text-white dark:hover:bg-gray-700" 
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payments
                </Button>
                
                <Button 
                  variant={activeTab === "system" ? "default" : "outline"} 
                  className="w-full justify-start dark:border-gray-600 dark:text-white dark:hover:bg-gray-700" 
                  onClick={() => setActiveTab("system")}
                >
                  <Database className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">General Settings</CardTitle>
                  <CardDescription className="dark:text-gray-300">Configure basic store information and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGeneralSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storeName" className="dark:text-white">Store Name</Label>
                        <Input 
                          id="storeName"
                          value={generalSettings.storeName}
                          onChange={(e) => setGeneralSettings({...generalSettings, storeName: e.target.value})}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="storeEmail" className="dark:text-white">Store Email</Label>
                        <Input 
                          id="storeEmail"
                          type="email"
                          value={generalSettings.storeEmail}
                          onChange={(e) => setGeneralSettings({...generalSettings, storeEmail: e.target.value})}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="storePhone" className="dark:text-white">Store Phone</Label>
                        <Input 
                          id="storePhone"
                          value={generalSettings.storePhone}
                          onChange={(e) => setGeneralSettings({...generalSettings, storePhone: e.target.value})}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="dark:text-white">Currency</Label>
                        <Select 
                          value={generalSettings.currency}
                          onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                        >
                          <SelectTrigger id="currency" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                            <SelectItem value="GBP">British Pound (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="storeAddress" className="dark:text-white">Store Address</Label>
                      <Input 
                        id="storeAddress"
                        value={generalSettings.storeAddress}
                        onChange={(e) => setGeneralSettings({...generalSettings, storeAddress: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language" className="dark:text-white">Language</Label>
                        <Select 
                          value={generalSettings.language}
                          onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}
                        >
                          <SelectTrigger id="language" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                            <SelectItem value="mr">Marathi</SelectItem>
                            <SelectItem value="ta">Tamil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timeZone" className="dark:text-white">Time Zone</Label>
                        <Select 
                          value={generalSettings.timeZone}
                          onValueChange={(value) => setGeneralSettings({...generalSettings, timeZone: value})}
                        >
                          <SelectTrigger id="timeZone" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="Asia/Kolkata">India (GMT+5:30)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (GMT-4)</SelectItem>
                            <SelectItem value="Europe/London">UK (GMT+1)</SelectItem>
                            <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch 
                        id="darkMode"
                        checked={generalSettings.darkMode}
                        onCheckedChange={handleDarkModeToggle}
                      />
                      <Label htmlFor="darkMode" className="dark:text-white">Enable Dark Mode</Label>
                    </div>
                    
                    <Button type="submit" className="mt-4">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="receipt">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Receipt Settings</CardTitle>
                  <CardDescription className="dark:text-gray-300">Configure how receipts are generated and delivered</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReceiptSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showLogo" className="dark:text-white">Show Store Logo</Label>
                        <Switch 
                          id="showLogo"
                          checked={receiptSettings.showLogo}
                          onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showLogo: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showStoreInfo" className="dark:text-white">Show Store Information</Label>
                        <Switch 
                          id="showStoreInfo"
                          checked={receiptSettings.showStoreInfo}
                          onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showStoreInfo: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showTaxInfo" className="dark:text-white">Show Tax Information</Label>
                        <Switch 
                          id="showTaxInfo"
                          checked={receiptSettings.showTaxInfo}
                          onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showTaxInfo: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="printAutomatically" className="dark:text-white">Print Automatically</Label>
                        <Switch 
                          id="printAutomatically"
                          checked={receiptSettings.printAutomatically}
                          onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, printAutomatically: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sendReceiptEmail" className="dark:text-white">Email Receipt</Label>
                        <Switch 
                          id="sendReceiptEmail"
                          checked={receiptSettings.sendReceiptEmail}
                          onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, sendReceiptEmail: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sendReceiptSMS" className="dark:text-white">SMS Receipt</Label>
                        <Switch 
                          id="sendReceiptSMS"
                          checked={receiptSettings.sendReceiptSMS}
                          onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, sendReceiptSMS: checked})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="footerText" className="dark:text-white">Receipt Footer Text</Label>
                      <Input 
                        id="footerText"
                        value={receiptSettings.footerText}
                        onChange={(e) => setReceiptSettings({...receiptSettings, footerText: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <Button type="submit" className="mt-4">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure payment methods and tax rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="acceptCash">Accept Cash Payments</Label>
                        <Switch 
                          id="acceptCash"
                          checked={paymentSettings.acceptCash}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptCash: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="acceptCard">Accept Card Payments</Label>
                        <Switch 
                          id="acceptCard"
                          checked={paymentSettings.acceptCard}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptCard: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="acceptDigitalWallet">Accept Digital Wallet</Label>
                        <Switch 
                          id="acceptDigitalWallet"
                          checked={paymentSettings.acceptDigitalWallet}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, acceptDigitalWallet: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableDiscount">Enable Discounts</Label>
                        <Switch 
                          id="enableDiscount"
                          checked={paymentSettings.enableDiscount}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableDiscount: checked})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
                        <Select 
                          value={paymentSettings.defaultPaymentMethod}
                          onValueChange={(value) => setPaymentSettings({...paymentSettings, defaultPaymentMethod: value})}
                        >
                          <SelectTrigger id="defaultPaymentMethod">
                            <SelectValue placeholder="Select default method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="digital-wallet">Digital Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="taxPercentage">Tax Percentage</Label>
                        <Input 
                          id="taxPercentage"
                          type="number"
                          value={paymentSettings.taxPercentage}
                          onChange={(e) => setPaymentSettings({...paymentSettings, taxPercentage: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="mt-4">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system behavior and security options</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSystemSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoBackup">Automatic Backup</Label>
                        <Switch 
                          id="autoBackup"
                          checked={systemSettings.autoBackup}
                          onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowOfflineMode">Allow Offline Mode</Label>
                        <Switch 
                          id="allowOfflineMode"
                          checked={systemSettings.allowOfflineMode}
                          onCheckedChange={(checked) => setSystemSettings({...systemSettings, allowOfflineMode: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requirePasswordForRefunds">Require Password for Refunds</Label>
                        <Switch 
                          id="requirePasswordForRefunds"
                          checked={systemSettings.requirePasswordForRefunds}
                          onCheckedChange={(checked) => setSystemSettings({...systemSettings, requirePasswordForRefunds: checked})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select 
                          value={systemSettings.backupFrequency}
                          onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}
                        >
                          <SelectTrigger id="backupFrequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dataRetentionPeriod">Data Retention (months)</Label>
                        <Input 
                          id="dataRetentionPeriod"
                          type="number"
                          value={systemSettings.dataRetentionPeriod}
                          onChange={(e) => setSystemSettings({...systemSettings, dataRetentionPeriod: Number(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                        <Input 
                          id="lowStockThreshold"
                          type="number"
                          value={systemSettings.lowStockThreshold}
                          onChange={(e) => setSystemSettings({...systemSettings, lowStockThreshold: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="mt-4">Save Changes</Button>
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

export default Settings;
