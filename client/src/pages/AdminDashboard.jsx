import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';
import SEOHead from '../components/SEOHead';
import OrderTimeline from '../components/OrderTimeline';
import {
  BarChart3, Package, ShoppingBag, Users, AlertTriangle, Plus, Edit2, Trash2, CheckCircle2,
  TrendingUp, RefreshCcw, Tag, Gift, Building2, ChevronDown, ChevronRight, LogOut, ShieldCheck, X,
  Phone, Mail, MapPin, Star, Eye, Calendar, CreditCard, IndianRupee, Copy, FileText, Sparkles, Image, Upload, QrCode, Check,
  Headphones, Briefcase, Globe, Scale, Send, MessageSquare, ExternalLink, Save, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4`}>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-black text-slate-900">{suffix}{value?.toLocaleString('en-IN') || 0}</p>
    </div>
  </div>
);

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [orderStatusFilter, setOrderStatusFilter] = React.useState('');
  const [showProductModal, setShowProductModal] = React.useState(false);
  const [showCouponModal, setShowCouponModal] = React.useState(false);
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [showUserOrdersModal, setShowUserOrdersModal] = React.useState(false);
  const [userOrdersData, setUserOrdersData] = React.useState([]);

  // Product form state
  const [productForm, setProductForm] = React.useState({
    name: '', price: '', originalPrice: '', stock: '', description: '', categoryId: '', isBestseller: false, isTrending: false,
    policyType: 'Return', returnPolicyDays: 7, policyTerms: 'Product can be returned or refunded within valid days if undamaged with original packaging.'
  });
  // Product image upload options state (Single vs Multiple)
  const [imageOption, setImageOption] = React.useState('single'); // 'single' | 'multiple'
  const [imageSource, setImageSource] = React.useState('file'); // 'file' | 'url'
  const [selectedImageFiles, setSelectedImageFiles] = React.useState([]);
  const [imageUrlInputs, setImageUrlInputs] = React.useState(['']);
  const [filePreviews, setFilePreviews] = React.useState([]);
  // Coupon form state
  const [couponForm, setCouponForm] = React.useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', expiryDate: ''
  });
  // Category form state
  const [categoryForm, setCategoryForm] = React.useState({ name: '', description: '', image: '' });
  const [categoryImageSource, setCategoryImageSource] = React.useState('file');
  const [categoryImageFile, setCategoryImageFile] = React.useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = React.useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = React.useState(false);

  // Banner form state
  const [showBannerModal, setShowBannerModal] = React.useState(false);
  const [bannerForm, setBannerForm] = React.useState({
    title: '', subtitle: '', ctaText: 'Shop Collection', categorySlug: '', image: '', type: 'hero'
  });
  const [bannerImageSource, setBannerImageSource] = React.useState('file');
  const [bannerImageFile, setBannerImageFile] = React.useState(null);
  const [bannerImagePreview, setBannerImagePreview] = React.useState('');
  const [isSubmittingBanner, setIsSubmittingBanner] = React.useState(false);
  // Delivery OTP inputs keyed by orderId
  const [deliveryOTPInputs, setDeliveryOTPInputs] = React.useState({});
  // Return OTP inputs keyed by orderId
  const [returnOTPInputs, setReturnOTPInputs] = React.useState({});
  // Estimated pickup days keyed by orderId
  const [pickupDaysInputs, setPickupDaysInputs] = React.useState({});

  // ── Edit Product State ──
  const [showEditProductModal, setShowEditProductModal] = React.useState(false);
  const [editingProductId, setEditingProductId] = React.useState(null);
  const [editProductForm, setEditProductForm] = React.useState({
    name: '', price: '', originalPrice: '', stock: '', description: '', categoryId: '', isBestseller: false, isTrending: false,
    policyType: 'Return', returnPolicyDays: 7, policyTerms: ''
  });
  const [editSelectedImageFiles, setEditSelectedImageFiles] = React.useState([]);
  const [editFilePreviews, setEditFilePreviews] = React.useState([]);
  const [editExistingImages, setEditExistingImages] = React.useState([]);
  const [editReplaceImages, setEditReplaceImages] = React.useState(false);
  const [isSubmittingEditProduct, setIsSubmittingEditProduct] = React.useState(false);

  // ── Edit Category State ──
  const [showEditCategoryModal, setShowEditCategoryModal] = React.useState(false);
  const [editingCategoryId, setEditingCategoryId] = React.useState(null);
  const [editCategoryForm, setEditCategoryForm] = React.useState({ name: '', description: '', image: '', displayOrder: 0 });
  const [editCategoryImageFile, setEditCategoryImageFile] = React.useState(null);
  const [editCategoryImagePreview, setEditCategoryImagePreview] = React.useState('');
  const [isSubmittingEditCategory, setIsSubmittingEditCategory] = React.useState(false);

  // ── Edit Banner State ──
  const [showEditBannerModal, setShowEditBannerModal] = React.useState(false);
  const [editingBannerId, setEditingBannerId] = React.useState(null);
  const [editBannerForm, setEditBannerForm] = React.useState({
    title: '', subtitle: '', ctaText: 'Shop Collection', categorySlug: '', image: '', type: 'hero', displayOrder: 0
  });
  const [editBannerImageFile, setEditBannerImageFile] = React.useState(null);
  const [editBannerImagePreview, setEditBannerImagePreview] = React.useState('');
  const [isSubmittingEditBanner, setIsSubmittingEditBanner] = React.useState(false);

  // Redirect if not admin/support
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'support')) {
      navigate('/profile');
    }
  }, [user, navigate]);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await API.get('/admin/dashboard-stats');
      return res.data;
    }
  });

  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['adminOrders', orderStatusFilter],
    queryFn: async () => {
      const res = await API.get(`/orders/admin/all?status=${orderStatusFilter}&limit=30`);
      return res.data;
    }
  });

  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const res = await API.get('/products?limit=50');
      return res.data;
    }
  });

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const res = await API.get('/categories');
      return res.data;
    }
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await API.get('/admin/users');
      return res.data;
    },
    enabled: user?.role === 'admin'
  });

  const { data: couponsData, refetch: refetchCoupons } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await API.get('/content/coupons');
      return res.data;
    }
  });

  const { data: corporateData } = useQuery({
    queryKey: ['corporateLeads'],
    queryFn: async () => {
      const res = await API.get('/corporate/inquiries');
      return res.data;
    },
    enabled: user?.role === 'admin'
  });

  const { data: heroBannersData, refetch: refetchHeroBanners } = useQuery({
    queryKey: ['adminHeroBanners'],
    queryFn: async () => {
      const res = await API.get('/content/banners?type=hero');
      return res.data;
    }
  });

  const { data: promoBannersData, refetch: refetchPromoBanners } = useQuery({
    queryKey: ['adminPromoBanners'],
    queryFn: async () => {
      const res = await API.get('/content/banners?type=promo');
      return res.data;
    }
  });

  const [paymentDaysFilter, setPaymentDaysFilter] = React.useState(30);

  const { data: paymentsData, refetch: refetchPayments } = useQuery({
    queryKey: ['adminPayments', paymentDaysFilter],
    queryFn: async () => {
      const res = await API.get(`/admin/payments?days=${paymentDaysFilter}`);
      return res.data;
    }
  });

  // ── UPI Payment Verification Query ──────────────────────────────────────────
  const { data: pendingPaymentsData, refetch: refetchPendingPayments } = useQuery({
    queryKey: ['adminPendingUPIPayments'],
    queryFn: async () => {
      const res = await API.get('/admin/payments/pending');
      return res.data;
    }
  });

  // ── Admin UPI Settings Query ───────────────────────────────────────────────
  const { data: adminUPISettingsData, refetch: refetchAdminUPISettings } = useQuery({
    queryKey: ['adminUPISettings'],
    queryFn: async () => {
      const res = await API.get('/admin/upi-settings');
      return res.data;
    }
  });

  // ── Support Tickets Query ──
  const { data: supportTicketsData, refetch: refetchSupportTickets } = useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: async () => {
      const res = await API.get('/content/support-tickets');
      return res.data;
    }
  });

  // ── Job Applications Query ──
  const { data: jobApplicationsData, refetch: refetchJobApplications } = useQuery({
    queryKey: ['adminJobApplications'],
    queryFn: async () => {
      const res = await API.get('/content/careers/applications');
      return res.data;
    }
  });

  // ── Grievances Query ──
  const { data: grievancesData, refetch: refetchGrievances } = useQuery({
    queryKey: ['adminGrievances'],
    queryFn: async () => {
      const res = await API.get('/content/grievances');
      return res.data;
    }
  });

  // ── Company Settings Query ──
  const { data: companySettingsData, refetch: refetchCompanySettings } = useQuery({
    queryKey: ['adminCompanySettings'],
    queryFn: async () => {
      const res = await API.get('/content/company-settings');
      return res.data;
    }
  });

  const pendingPayments = pendingPaymentsData?.payments || [];
  const pendingUPIVerificationCount = pendingPayments.filter(p => p.paymentStatus === 'PENDING_VERIFICATION').length;

  const currentUPISettings = adminUPISettingsData?.settings || { upiId: 'shreemaruti@upi', isActive: true };

  // UPI Settings Form State
  const [upiIdForm, setUpiIdForm] = React.useState('');
  const [newQrCodeFile, setNewQrCodeFile] = React.useState(null);
  const [newQrCodePreview, setNewQrCodePreview] = React.useState('');
  const [isUpdatingQrCode, setIsUpdatingQrCode] = React.useState(false);
  const [rejectModalPayment, setRejectModalPayment] = React.useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState('');
  const [selectedScreenshotModal, setSelectedScreenshotModal] = React.useState(null);

  // Ticket Response Modal State
  const [selectedTicketModal, setSelectedTicketModal] = React.useState(null);
  const [ticketReplyText, setTicketReplyText] = React.useState('');
  const [ticketStatusInput, setTicketStatusInput] = React.useState('Responded');
  const [isSavingTicket, setIsSavingTicket] = React.useState(false);

  // Job App Review Modal State
  const [selectedAppModal, setSelectedAppModal] = React.useState(null);
  const [appNotesInput, setAppNotesInput] = React.useState('');
  const [appStatusInput, setAppStatusInput] = React.useState('Under Review');
  const [isSavingApp, setIsSavingApp] = React.useState(false);

  // Grievance Review Modal State
  const [selectedGrievanceModal, setSelectedGrievanceModal] = React.useState(null);
  const [grievanceNotesInput, setGrievanceNotesInput] = React.useState('');
  const [grievanceStatusInput, setGrievanceStatusInput] = React.useState('In Progress');
  const [isSavingGrievance, setIsSavingGrievance] = React.useState(false);

  // Company Settings Form State
  const [companySettingsForm, setCompanySettingsForm] = React.useState(null);
  const [isSavingCompanySettings, setIsSavingCompanySettings] = React.useState(false);

  React.useEffect(() => {
    if (companySettingsData?.settings) {
      setCompanySettingsForm(companySettingsData.settings);
    }
  }, [companySettingsData]);

  const stats = statsData?.stats || {};
  const lowStockProducts = statsData?.lowStockProducts || [];
  const recentOrders = statsData?.recentOrders || [];
  const orders = ordersData?.orders || [];
  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];
  const coupons = couponsData?.coupons || [];
  const corporateLeads = corporateData?.inquiries || [];
  const allUsers = usersData?.users || [];
  const dailyOrders = statsData?.dailyOrders || [];
  const paymentDays = paymentsData?.days || [];
  const paymentSummary = paymentsData?.summary || { totalRevenue: 0, totalOrders: 0 };
  const supportTickets = supportTicketsData?.tickets || [];
  const jobApplications = jobApplicationsData?.applications || [];
  const grievancesList = grievancesData?.grievances || [];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId, status) => {
    // For Delivered: require OTP
    if (status === 'Delivered') {
      const otp = deliveryOTPInputs[orderId]?.trim();
      if (!otp || otp.length !== 6) {
        toast.error('Enter the 6-digit Delivery OTP shared by the customer');
        return;
      }
      try {
        await API.put(`/orders/${orderId}/status`, { status, otp });
        toast.success('Order marked as Delivered! OTP verified ✓');
        setDeliveryOTPInputs(prev => ({ ...prev, [orderId]: '' }));
        refetchOrders();
        refetchStats();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed: OTP mismatch or error');
      }
      return;
    }
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to "${status}"`);
      refetchOrders();
      refetchStats();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleVerifyReturnOTP = async (orderId) => {
    const otp = returnOTPInputs[orderId]?.trim();
    if (!otp || otp.length !== 6) {
      toast.error('Enter the 6-digit Return Pickup OTP from the customer');
      return;
    }
    try {
      const res = await API.post(`/orders/${orderId}/verify-return-otp`, { otp });
      toast.success(res.data.message || 'Return confirmed! Refund initiated ✓');
      setReturnOTPInputs(prev => ({ ...prev, [orderId]: '' }));
      refetchOrders();
      refetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await API.delete(`/products/${id}`);
      toast.success(res.data?.message || 'Product deleted successfully');
      refetchProducts();
      refetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod._id);
    setEditProductForm({
      name: prod.name || '',
      price: prod.price !== undefined ? prod.price : '',
      originalPrice: prod.originalPrice !== undefined ? prod.originalPrice : '',
      stock: prod.stock !== undefined ? prod.stock : '',
      description: prod.description || '',
      categoryId: prod.category?._id || prod.category || '',
      isBestseller: Boolean(prod.isBestseller),
      isTrending: Boolean(prod.isTrending),
      policyType: prod.policyType || 'Return',
      returnPolicyDays: prod.returnPolicyDays !== undefined ? prod.returnPolicyDays : 7,
      policyTerms: prod.policyTerms || ''
    });
    setEditExistingImages(prod.images || []);
    setEditSelectedImageFiles([]);
    setEditFilePreviews([]);
    setEditReplaceImages(false);
    setShowEditProductModal(true);
  };

  const handleEditProductFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setEditSelectedImageFiles(files);
    setEditFilePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSubmittingEditProduct(true);
    try {
      const validatedDays = Math.min(7, Math.max(0, Number(editProductForm.returnPolicyDays) || 0));

      if (editSelectedImageFiles.length > 0) {
        const formData = new FormData();
        formData.append('name', editProductForm.name);
        formData.append('categoryId', editProductForm.categoryId);
        formData.append('price', editProductForm.price);
        formData.append('originalPrice', editProductForm.originalPrice || editProductForm.price);
        formData.append('stock', editProductForm.stock);
        formData.append('description', editProductForm.description);
        formData.append('isBestseller', editProductForm.isBestseller);
        formData.append('isTrending', editProductForm.isTrending);
        formData.append('policyType', editProductForm.policyType || 'Return');
        formData.append('returnPolicyDays', validatedDays);
        formData.append('policyTerms', editProductForm.policyTerms || '');
        formData.append('replaceImages', editReplaceImages ? 'true' : 'false');

        editSelectedImageFiles.forEach((file) => {
          formData.append('images', file);
        });

        await API.put(`/products/${editingProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.put(`/products/${editingProductId}`, {
          ...editProductForm,
          price: Number(editProductForm.price),
          originalPrice: Number(editProductForm.originalPrice || editProductForm.price),
          stock: Number(editProductForm.stock),
          returnPolicyDays: validatedDays,
          images: editExistingImages
        });
      }

      toast.success('Product updated successfully! ✓');
      setShowEditProductModal(false);
      refetchProducts();
      refetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmittingEditProduct(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (imageOption === 'single') {
      const singleFile = files[0];
      setSelectedImageFiles([singleFile]);
      setFilePreviews([URL.createObjectURL(singleFile)]);
    } else {
      const updatedFiles = [...selectedImageFiles, ...files];
      setSelectedImageFiles(updatedFiles);
      setFilePreviews(updatedFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const removeFile = (index) => {
    const updatedFiles = selectedImageFiles.filter((_, i) => i !== index);
    setSelectedImageFiles(updatedFiles);
    setFilePreviews(updatedFiles.map(file => URL.createObjectURL(file)));
  };

  const handleUrlChange = (index, value) => {
    const updated = [...imageUrlInputs];
    updated[index] = value;
    setImageUrlInputs(updated);
  };

  const addUrlInput = () => {
    setImageUrlInputs([...imageUrlInputs, '']);
  };

  const removeUrlInput = (index) => {
    setImageUrlInputs(imageUrlInputs.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const validatedDays = Math.min(7, Math.max(0, Number(productForm.returnPolicyDays) || 0));

      if (imageSource === 'file' && selectedImageFiles.length > 0) {
        const formData = new FormData();
        formData.append('name', productForm.name);
        formData.append('categoryId', productForm.categoryId);
        formData.append('price', productForm.price);
        formData.append('originalPrice', productForm.originalPrice || productForm.price);
        formData.append('stock', productForm.stock);
        formData.append('description', productForm.description);
        formData.append('isBestseller', productForm.isBestseller);
        formData.append('isTrending', productForm.isTrending);
        formData.append('policyType', productForm.policyType || 'Return');
        formData.append('returnPolicyDays', validatedDays);
        formData.append('policyTerms', productForm.policyTerms || '');

        selectedImageFiles.forEach((file) => {
          formData.append('images', file);
        });

        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const validUrls = imageUrlInputs.filter(url => url.trim() !== '');
        const imageUrls = validUrls.length > 0 ? validUrls : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop'];

        await API.post('/products', {
          ...productForm,
          price: Number(productForm.price),
          originalPrice: Number(productForm.originalPrice || productForm.price),
          stock: Number(productForm.stock),
          returnPolicyDays: validatedDays,
          imageUrls
        });
      }

      toast.success('Product created successfully!');
      setShowProductModal(false);
      setProductForm({ name: '', price: '', originalPrice: '', stock: '', description: '', categoryId: '', isBestseller: false, isTrending: false });
      setSelectedImageFiles([]);
      setFilePreviews([]);
      setImageUrlInputs(['']);
      refetchProducts();
      refetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post('/content/coupons', {
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minOrderValue: Number(couponForm.minOrderValue || 0)
      });
      toast.success('Coupon created successfully!');
      setShowCouponModal(false);
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', expiryDate: '' });
      refetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setIsSubmittingCategory(true);
    try {
      if (categoryImageSource === 'file' && categoryImageFile) {
        const formData = new FormData();
        formData.append('name', categoryForm.name);
        formData.append('description', categoryForm.description || '');
        formData.append('image', categoryImageFile);

        await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (!categoryForm.image) {
          toast.error('Please upload an image file or enter an image URL');
          setIsSubmittingCategory(false);
          return;
        }
        await API.post('/categories', categoryForm);
      }
      toast.success('Category created successfully & saved to Cloudinary! ✓');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', image: '' });
      setCategoryImageFile(null);
      setCategoryImagePreview('');
      refetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategoryId(cat._id);
    setEditCategoryForm({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 0
    });
    setEditCategoryImageFile(null);
    setEditCategoryImagePreview('');
    setShowEditCategoryModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setIsSubmittingEditCategory(true);
    try {
      if (editCategoryImageFile) {
        const formData = new FormData();
        formData.append('name', editCategoryForm.name);
        formData.append('description', editCategoryForm.description || '');
        formData.append('displayOrder', editCategoryForm.displayOrder || 0);
        formData.append('image', editCategoryImageFile);

        await API.put(`/categories/${editingCategoryId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.put(`/categories/${editingCategoryId}`, editCategoryForm);
      }

      toast.success('Category updated successfully! ✓');
      setShowEditCategoryModal(false);
      refetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSubmittingEditCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await API.delete(`/categories/${id}`);
      toast.success(res.data?.message || 'Category deleted successfully');
      refetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleProcessReturn = async (orderId, action) => {
    const days = Number(pickupDaysInputs[orderId]) || 2;
    try {
      await API.put(`/orders/${orderId}/process-return`, { action, estimatedPickupDays: days });
      toast.success(`Return request ${action}! ${action === 'Approved' ? `Pickup in ${days} days. OTP sent to customer.` : ''}`);
      refetchOrders();
    } catch (err) {
      toast.error('Failed to process return');
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    setIsSubmittingBanner(true);
    try {
      const link = bannerForm.categorySlug ? `/products?category=${bannerForm.categorySlug}` : '/products';

      if (bannerImageSource === 'file' && bannerImageFile) {
        const formData = new FormData();
        formData.append('title', bannerForm.title);
        formData.append('subtitle', bannerForm.subtitle || '');
        formData.append('ctaText', bannerForm.ctaText || 'Shop Collection');
        formData.append('categorySlug', bannerForm.categorySlug || '');
        formData.append('type', bannerForm.type || 'hero');
        formData.append('link', link);
        formData.append('image', bannerImageFile);

        await API.post('/content/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (!bannerForm.image) {
          toast.error('Please upload an image file or enter an image URL');
          setIsSubmittingBanner(false);
          return;
        }
        await API.post('/content/banners', {
          ...bannerForm,
          link
        });
      }
      toast.success('Homepage banner card created & saved to Cloudinary! ✓');
      setShowBannerModal(false);
      setBannerForm({ title: '', subtitle: '', ctaText: 'Shop Collection', categorySlug: '', image: '', type: 'hero' });
      setBannerImageFile(null);
      setBannerImagePreview('');
      refetchHeroBanners();
      refetchPromoBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create banner card');
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  const handleOpenEditBanner = (b) => {
    setEditingBannerId(b._id);
    setEditBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      ctaText: b.ctaText || 'Shop Collection',
      categorySlug: b.categorySlug || '',
      image: b.image || '',
      type: b.type || 'hero',
      displayOrder: b.displayOrder || 0
    });
    setEditBannerImageFile(null);
    setEditBannerImagePreview('');
    setShowEditBannerModal(true);
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    setIsSubmittingEditBanner(true);
    try {
      const link = editBannerForm.categorySlug ? `/products?category=${editBannerForm.categorySlug}` : '/products';

      if (editBannerImageFile) {
        const formData = new FormData();
        formData.append('title', editBannerForm.title);
        formData.append('subtitle', editBannerForm.subtitle || '');
        formData.append('ctaText', editBannerForm.ctaText || 'Shop Collection');
        formData.append('categorySlug', editBannerForm.categorySlug || '');
        formData.append('type', editBannerForm.type || 'hero');
        formData.append('link', link);
        formData.append('displayOrder', editBannerForm.displayOrder || 0);
        formData.append('image', editBannerImageFile);

        await API.put(`/content/banners/${editingBannerId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.put(`/content/banners/${editingBannerId}`, {
          ...editBannerForm,
          link
        });
      }

      toast.success('Banner updated successfully! ✓');
      setShowEditBannerModal(false);
      refetchHeroBanners();
      refetchPromoBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update banner');
    } finally {
      setIsSubmittingEditBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner card?')) return;
    try {
      const res = await API.delete(`/content/banners/${id}`);
      toast.success(res.data?.message || 'Banner deleted successfully');
      refetchHeroBanners();
      refetchPromoBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete banner');
    }
  };

  const handleViewUserOrders = async (u) => {
    setSelectedUser(u);
    try {
      const res = await API.get(`/admin/users/${u._id}/orders`);
      setUserOrdersData(res.data.orders || []);
    } catch {
      setUserOrdersData([]);
    }
    setShowUserOrdersModal(true);
  };

  const sidebarTabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'upi_verification', label: 'UPI Verification', icon: QrCode },
    { id: 'upi_settings', label: 'UPI Payment Settings', icon: Sparkles },
    { id: 'payments', label: 'Day-wise Payments', icon: CreditCard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'banners', label: 'Home Banners & Cards', icon: Image },
    { id: 'coupons', label: 'Coupons', icon: Gift },
    { id: 'support_tickets', label: 'Support & Help Desk', icon: Headphones },
    { id: 'job_applications', label: 'Careers & Hiring', icon: Briefcase },
    { id: 'grievances', label: 'Grievance Redressal', icon: Scale },
    ...(user?.role === 'admin' ? [
      { id: 'users', label: 'All Users', icon: Users },
      { id: 'corporate', label: 'Corporate Leads', icon: Building2 },
      { id: 'company_settings', label: 'Company & Social Settings', icon: Globe }
    ] : []),
    { id: 'lowstock', label: 'Low Stock Alerts', icon: AlertTriangle }
  ];

  const orderStatuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const getStatusStageRank = (status) => {
    switch (status) {
      case 'PAYMENT_PENDING':
      case 'PAYMENT_VERIFICATION_PENDING':
        return 0;
      case 'Placed':
        return 1;
      case 'Confirmed':
      case 'CONFIRMED':
        return 2;
      case 'Packed':
        return 3;
      case 'Shipped':
        return 4;
      case 'Out for Delivery':
        return 5;
      case 'Delivered':
        return 6;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SEOHead title="Admin Dashboard" />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed top-0 left-0 h-full z-30 flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-amber-600 p-2 rounded-xl">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">ShriMaruti</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Admin Panel</span>
            </div>
          </Link>
        </div>

        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 p-2">
            <div className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-black text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[140px]">{user?.name}</p>
              <p className="text-[10px] text-amber-400 font-bold capitalize">{user?.role} Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'upi_verification' && pendingUPIVerificationCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {pendingUPIVerificationCount}
                </span>
              )}
              {tab.id === 'lowstock' && lowStockProducts.length > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {lowStockProducts.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <ShieldCheck className="w-4 h-4" /> View Live Store
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-900/30 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 overflow-y-auto min-h-screen">

        {/* ── UPI PAYMENT VERIFICATION TAB ──────────────────────────────────── */}
        {activeTab === 'upi_verification' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-amber-600" /> UPI Manual Payment Verification
                </h1>
                <p className="text-xs text-slate-500 mt-1">Review customer payment screenshots & UTRs to confirm orders</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>{pendingUPIVerificationCount} Payments Pending Verification</span>
              </div>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">All UPI Payments Cleared!</h3>
                <p className="text-xs text-slate-500">There are no pending UPI verification requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingPayments.map(p => {
                  const order = p.orderId || {};
                  const userObj = p.userId || {};
                  const isPending = p.paymentStatus === 'PENDING_VERIFICATION';

                  return (
                    <div key={p._id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5 transition hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">Order #{order.orderNumber || '—'}</span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              p.paymentStatus === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.paymentStatus === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900 animate-pulse'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Submitted on {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    await API.patch(`/admin/payments/${p._id}/confirm`);
                                    toast.success('Payment verified & order confirmed! 🎉');
                                    refetchPendingPayments();
                                    refetchOrders();
                                    refetchStats();
                                  } catch (err) {
                                    toast.error(err.response?.data?.message || 'Failed to confirm payment');
                                  }
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                              >
                                <Check className="w-4 h-4" /> CONFIRM PAYMENT
                              </button>

                              <button
                                onClick={() => {
                                  setRejectModalPayment(p);
                                  setRejectionReasonInput('Payment screenshot is unclear or transaction mismatch');
                                }}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                              >
                                <X className="w-4 h-4" /> REJECT PAYMENT
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        {/* Customer Info */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Customer Details</span>
                          <p className="font-extrabold text-slate-900 text-sm">{userObj.name || order.senderDetails?.name || 'Guest User'}</p>
                          <p className="text-slate-700 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-amber-600" /> {userObj.phone || order.senderDetails?.phone || '—'}
                          </p>
                          <p className="text-slate-700 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-amber-600" /> {userObj.email || order.senderDetails?.email || '—'}
                          </p>
                        </div>

                        {/* Order Info */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Order Items & Total</span>
                          <p className="font-extrabold text-amber-700 text-base">₹{(p.amount || order.pricing?.totalAmount || 0).toLocaleString('en-IN')}</p>
                          <div className="space-y-1 mt-1 max-h-24 overflow-y-auto">
                            {(order.orderItems || []).map((item, idx) => (
                              <p key={idx} className="text-[11px] text-slate-700 truncate">
                                • {item.name} <span className="font-bold text-slate-900">x{item.qty}</span> (₹{item.price * item.qty})
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Payment Submission Proof */}
                        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70 space-y-2">
                          <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">Payment Verification Proof</span>
                          <p className="text-slate-800">
                            <strong>Method:</strong> {p.paymentMethod || 'UPI'}
                          </p>
                          <p className="text-slate-800 font-mono">
                            <strong>UTR Number:</strong> <span className="bg-white px-2 py-0.5 rounded border border-amber-300 font-black text-amber-900">{p.utrNumber}</span>
                          </p>
                          <p className="text-slate-800 text-[11px]">
                            <strong>UPI ID Used:</strong> {p.upiIdUsed || 'shreemaruti@upi'}
                          </p>

                          {p.paymentScreenshot?.url && (
                            <button
                              type="button"
                              onClick={() => setSelectedScreenshotModal(p.paymentScreenshot.url)}
                              className="mt-2 w-full py-2 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" /> View Payment Screenshot
                            </button>
                          )}
                        </div>
                      </div>

                      {p.rejectionReason && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <strong>Rejection Reason:</strong> {p.rejectionReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── UPI PAYMENT SETTINGS TAB ──────────────────────────────────────── */}
        {activeTab === 'upi_settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" /> Dynamic UPI Payment Settings
              </h1>
              <p className="text-xs text-slate-500 mt-1">Configure active UPI ID & QR Code displayed on customer checkout page</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
              {/* Active Status Banner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">UPI Payment Status</span>
                  <span className="text-[11px] text-slate-500">Enable or disable UPI payment option on checkout</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await API.patch('/admin/upi-settings', { isActive: !currentUPISettings.isActive });
                      toast.success(`UPI Payment Option ${!currentUPISettings.isActive ? 'Activated' : 'Deactivated'}!`);
                      refetchAdminUPISettings();
                    } catch (err) {
                      toast.error('Failed to toggle status');
                    }
                  }}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition ${
                    currentUPISettings.isActive
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                  }`}
                >
                  {currentUPISettings.isActive ? '✓ ACTIVE ON CHECKOUT' : 'DISABLED'}
                </button>
              </div>

              {/* UPI ID Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await API.patch('/admin/upi-settings', { upiId: upiIdForm || currentUPISettings.upiId });
                    toast.success('UPI ID updated successfully! ✓');
                    refetchAdminUPISettings();
                  } catch (err) {
                    toast.error('Failed to update UPI ID');
                  }
                }}
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Active UPI ID</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      defaultValue={currentUPISettings.upiId || 'shreemaruti@upi'}
                      onChange={e => setUpiIdForm(e.target.value)}
                      placeholder="e.g. shreemaruti@upi"
                      className="flex-1 px-4 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Update UPI ID
                    </button>
                  </div>
                </div>
              </form>

              {/* QR Code Cloudinary Upload */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Current Active QR Code Preview</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-amber-500/30 p-2 bg-white shadow-md flex-shrink-0">
                    <img
                      src={currentUPISettings.qrCode?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop'}
                      alt="Active QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newQrCodeFile) {
                        toast.error('Please select a QR code image to upload');
                        return;
                      }
                      setIsUpdatingQrCode(true);
                      try {
                        const formData = new FormData();
                        formData.append('qrCode', newQrCodeFile);
                        if (upiIdForm) formData.append('upiId', upiIdForm);

                        await API.post('/admin/upi-settings/qr', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });

                        toast.success('New QR Code uploaded to Cloudinary & live on checkout! 🎉');
                        setNewQrCodeFile(null);
                        setNewQrCodePreview('');
                        refetchAdminUPISettings();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed to upload QR Code');
                      } finally {
                        setIsUpdatingQrCode(false);
                      }
                    }}
                    className="flex-1 space-y-3 w-full"
                  >
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setNewQrCodeFile(file);
                            setNewQrCodePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <Upload className="w-7 h-7 text-amber-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold text-slate-700">Upload New QR Code Image</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Saves image directly to Cloudinary DB</span>
                    </label>

                    {newQrCodePreview && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 w-28 mx-auto">
                        <img src={newQrCodePreview} alt="New QR Preview" className="w-full h-full object-contain p-1" />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdatingQrCode || !newQrCodeFile}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      {isUpdatingQrCode ? (
                        <>
                          <RefreshCcw className="w-4 h-4 animate-spin" /> Uploading QR to Cloudinary...
                        </>
                      ) : (
                        '☁️ Upload & Save QR Code to Cloudinary'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard Overview</h1>
              <p className="text-xs text-slate-500 mt-1">Live analytics and platform health metrics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total Revenue" value={stats.totalRevenue} icon={TrendingUp} color="bg-amber-600" suffix="₹" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-indigo-600" />
              <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="bg-emerald-600" />
              <StatCard title="Registered Users" value={stats.totalUsers} icon={Users} color="bg-rose-600" />
            </div>

            {/* Today's Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold text-amber-100 uppercase tracking-wide">Today's Orders</p>
                <p className="text-4xl font-black mt-1">{stats.todayOrders || 0}</p>
                <p className="text-xs text-amber-200 mt-1">Orders placed today</p>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Today's Revenue</p>
                <p className="text-4xl font-black mt-1">₹{(stats.todayRevenue || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-emerald-200 mt-1">From paid orders today</p>
              </div>
            </div>

            {/* Daily Orders Chart (Last 14 Days) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Daily Orders — Last 14 Days</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                  {dailyOrders.reduce((a, d) => a + d.orders, 0)} total orders
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-36 overflow-x-auto pb-2">
                {dailyOrders.map((day, i) => {
                  const maxOrders = Math.max(...dailyOrders.map(d => d.orders), 1);
                  const heightPct = day.orders === 0 ? 4 : Math.max(8, (day.orders / maxOrders) * 100);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[32px] group relative">
                      <div
                        className="w-full bg-amber-500 hover:bg-amber-600 rounded-t-md transition-all duration-300 cursor-pointer"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                          {day.orders} orders · ₹{day.revenue.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium rotate-45 origin-left mt-1 whitespace-nowrap">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map(order => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">#{order.orderNumber}</span>
                        <span className="text-slate-500">{order.senderDetails?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-amber-700 block">₹{order.pricing?.totalAmount}</span>
                        <span className={`text-[10px] font-bold ${
                          order.orderStatus === 'Delivered' ? 'text-emerald-600' :
                          order.orderStatus === 'Placed' ? 'text-blue-600' : 'text-amber-600'
                        }`}>{order.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No orders yet</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Low Stock Alerts
                </h3>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 6).map(prod => (
                    <div key={prod._id} className="flex items-center justify-between text-xs p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                      <span className="font-bold text-slate-800 line-clamp-1 flex-1">{prod.name}</span>
                      <span className="text-rose-700 font-black ml-2">Stock: {prod.stock}</span>
                    </div>
                  ))}
                  {lowStockProducts.length === 0 && <p className="text-xs text-emerald-600 font-bold text-center py-4">✓ All products well stocked!</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ──────────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-amber-600" /> Day-Wise Payments & Settlements
                </h1>
                <p className="text-xs text-slate-500 mt-1">Detailed breakdown of paid orders grouped by date with customer contact details</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={paymentDaysFilter}
                  onChange={(e) => setPaymentDaysFilter(Number(e.target.value))}
                  className="text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold outline-none bg-white shadow-xs"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={14}>Last 14 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                </select>
                <button
                  onClick={() => refetchPayments()}
                  className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-xs"
                  title="Refresh Payment Data"
                >
                  <RefreshCcw className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-tr from-amber-600 to-amber-500 rounded-2xl p-5 text-white shadow-md">
                <p className="text-xs font-bold text-amber-100 uppercase tracking-wide">Total Paid Revenue</p>
                <p className="text-3xl font-black mt-1">₹{(paymentSummary.totalRevenue || 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-amber-200 mt-1">Over last {paymentDaysFilter} days</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paid Transactions</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{paymentSummary.totalOrders || 0}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ 100% Verified Payments</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Avg Order Value</p>
                <p className="text-3xl font-black text-amber-700 mt-1">
                  ₹{paymentSummary.totalOrders ? Math.round(paymentSummary.totalRevenue / paymentSummary.totalOrders).toLocaleString('en-IN') : 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Per transaction average</p>
              </div>
            </div>

            {/* Day-Wise Breakdown List */}
            <div className="space-y-6">
              {paymentDays.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500 font-medium border border-slate-200">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">No payment transactions recorded in the last {paymentDaysFilter} days</p>
                  <p className="text-xs text-slate-400 mt-1">Try selecting a larger date range from the dropdown filter above.</p>
                </div>
              ) : (
                paymentDays.map((day) => (
                  <div key={day.date} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
                    
                    {/* Day Header Banner */}
                    <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-600 p-2 rounded-xl text-white font-black text-xs">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-white">{day.displayDate}</h3>
                          <span className="text-[10px] text-amber-400 font-semibold">{day.orderCount} paid transaction{day.orderCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Day Revenue</span>
                        <span className="text-lg font-black text-amber-400">₹{day.totalRevenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Day Transactions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-extrabold text-slate-700">Order #</th>
                            <th className="px-4 py-3 text-left font-extrabold text-slate-700">Paid User Name</th>
                            <th className="px-4 py-3 text-left font-extrabold text-slate-700">Phone Number</th>
                            <th className="px-4 py-3 text-left font-extrabold text-slate-700">Email Address</th>
                            <th className="px-4 py-3 text-left font-extrabold text-slate-700">Order Items</th>
                            <th className="px-4 py-3 text-right font-extrabold text-slate-700">Price Paid</th>
                            <th className="px-4 py-3 text-center font-extrabold text-slate-700">Method / UTR</th>
                            <th className="px-4 py-3 text-center font-extrabold text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {day.transactions.map((tx) => (
                            <tr key={tx.orderId} className="hover:bg-amber-50/40 transition">
                              
                              {/* Order Number */}
                              <td className="px-4 py-3 font-extrabold text-slate-900 whitespace-nowrap">
                                #{tx.orderNumber}
                              </td>

                              {/* Customer Name */}
                              <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                                    {tx.customerName.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{tx.customerName}</span>
                                </div>
                              </td>

                              {/* Phone */}
                              <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">
                                <div className="flex items-center gap-1 text-slate-800">
                                  <Phone className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                  <span>{tx.customerPhone.startsWith('+91') ? tx.customerPhone : `+91 ${tx.customerPhone}`}</span>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span>{tx.customerEmail}</span>
                                </div>
                              </td>

                              {/* Items */}
                              <td className="px-4 py-3 text-slate-600 max-w-[200px]">
                                <span className="line-clamp-1 font-medium" title={tx.items.join(', ')}>
                                  {tx.items.join(', ')} {tx.itemCount > 3 ? `+${tx.itemCount - 3} more` : ''}
                                </span>
                              </td>

                              {/* Price Paid */}
                              <td className="px-4 py-3 text-right font-black text-amber-700 text-sm whitespace-nowrap">
                                ₹{tx.amount.toLocaleString('en-IN')}
                              </td>

                              {/* Payment Method + UTR */}
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`inline-block font-extrabold text-[10px] px-2.5 py-1 rounded-full border ${
                                    tx.paymentMethod === 'UPI'
                                      ? 'bg-violet-100 text-violet-800 border-violet-200'
                                      : tx.paymentMethod === 'COD'
                                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                                      : 'bg-slate-100 text-slate-800 border-slate-200'
                                  }`}>
                                    {tx.paymentMethod === 'UPI' ? '📱 UPI' : tx.paymentMethod === 'COD' ? '💵 COD' : tx.paymentMethod}
                                  </span>
                                  {tx.utrNumber && (
                                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 max-w-[100px] truncate" title={`UTR: ${tx.utrNumber}`}>
                                      UTR: {tx.utrNumber}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 font-extrabold text-[10px] px-2.5 py-1 rounded-full ${
                                  tx.paymentStatus === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : tx.paymentStatus === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : tx.orderStatus === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  <CheckCircle2 className="w-3 h-3" />
                                  {tx.paymentStatus === 'CONFIRMED'
                                    ? 'UPI Verified'
                                    : tx.paymentStatus === 'Paid'
                                    ? 'Paid'
                                    : tx.orderStatus === 'Delivered'
                                    ? 'COD Collected'
                                    : tx.paymentStatus}
                                </span>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Order Fulfillment Center</h2>
              <div className="flex items-center gap-3">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold outline-none bg-white"
                >
                  <option value="">All Orders</option>
                  {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => refetchOrders()} className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">
                  <RefreshCcw className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-slate-500 font-medium border border-slate-200">No orders found</div>
              ) : orders.map(order => {
                const senderPhone = order.senderDetails?.phone || '';
                const formattedSenderPhone = senderPhone.startsWith('+91') ? senderPhone : (senderPhone ? `+91 ${senderPhone}` : '—');
                const recipientPhone = order.shippingAddress?.phone || '';
                const formattedRecipientPhone = recipientPhone.startsWith('+91') ? recipientPhone : (recipientPhone ? `+91 ${recipientPhone}` : '—');
                const giftMsg = order.giftOptions?.giftMessage;
                const isWrapped = order.giftOptions?.isGiftWrapped;

                const copyGiftMessage = (msg) => {
                  navigator.clipboard.writeText(msg);
                  toast.success('Gift message copied to clipboard!');
                };

                return (
                  <div key={order._id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                    
                    {/* Header: Order Number, Date, Price, Payment Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">#{order.orderNumber}</span>
                          <span className="text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-600 mt-0.5">
                          Method: <span className="text-slate-900">{order.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-amber-700 text-base">₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus === 'Paid' ? '✓ Paid' : order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Recipient Address Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                      
                      {/* Sender Info */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Sender / Buyer Details</span>
                        <p className="font-bold text-slate-900 text-sm">{order.senderDetails?.name || '—'}</p>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <strong className="text-slate-900">{formattedSenderPhone}</strong>
                        </p>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{order.senderDetails?.email || '—'}</span>
                        </p>
                      </div>

                      {/* Recipient Shipping Address */}
                      <div className="space-y-1 md:border-l md:border-slate-200 md:pl-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Recipient Delivery Address</span>
                        <p className="font-bold text-slate-900">{order.shippingAddress?.fullName || order.senderDetails?.name}</p>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <strong className="text-slate-900">{formattedRecipientPhone}</strong>
                        </p>
                        <p className="text-slate-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>
                            {order.shippingAddress?.street}, {order.shippingAddress?.landmark ? `${order.shippingAddress.landmark}, ` : ''}
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} — <strong>{order.shippingAddress?.pincode}</strong>
                          </span>
                        </p>
                      </div>

                    </div>

                    {/* 🎁 Personalized Gift Card Message & Velvet Wrapping Banner */}
                    {(giftMsg || isWrapped) && (
                      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-300 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <Gift className="w-4 h-4 text-amber-600" /> Personalized Gift Customization
                          </span>
                          {isWrapped && (
                            <span className="bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-3 h-3" /> Velvet Gift Wrapped (+₹49)
                            </span>
                          )}
                        </div>

                        {giftMsg ? (
                          <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-amber-800 font-bold">
                              <span>Message to print on gift card:</span>
                              <button
                                type="button"
                                onClick={() => copyGiftMessage(giftMsg)}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-md flex items-center gap-1 transition"
                              >
                                <Copy className="w-3 h-3" /> Copy Message
                              </button>
                            </div>
                            <p className="text-slate-900 italic font-semibold text-xs bg-amber-50/50 p-2.5 rounded-md border-l-4 border-amber-500 whitespace-pre-wrap">
                              "{giftMsg}"
                            </p>
                          </div>
                        ) : (
                          <p className="text-amber-800 text-[11px] font-medium">No custom message written for this gift.</p>
                        )}
                      </div>
                    )}

                    {/* Purchased Items List */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Ordered Items ({order.orderItems?.length || 0})</span>
                      <div className="divide-y divide-slate-100">
                        {order.orderItems?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-2 text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-slate-900">{item.name}</p>
                                {item.variantName && <span className="text-[10px] text-amber-700 font-semibold">{item.variantName}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-800">Qty: {item.qty}</span>
                              <span className="font-extrabold text-amber-700 block">₹{item.price * item.qty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Status Update Controls */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">Update Status:</span>
                        {orderStatuses.map(s => {
                          const currentRank = getStatusStageRank(order.orderStatus);
                          const btnRank = getStatusStageRank(s);
                          const isBackward = (btnRank < currentRank && s !== 'Cancelled') ||
                                             (order.orderStatus === 'Delivered' && s !== 'Delivered') ||
                                             (order.orderStatus === 'Cancelled' && s !== 'Cancelled');

                          return (
                            <button
                              key={s}
                              disabled={isBackward}
                              onClick={() => !isBackward && handleUpdateOrderStatus(order._id, s)}
                              title={isBackward ? `Cannot move order status backward to ${s}` : `Update status to ${s}`}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                                order.orderStatus === s
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                  : isBackward
                                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                                  : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-amber-400'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>

                      {/* Delivery OTP input — only when next step is Delivered */}
                      {(order.orderStatus === 'Shipped' || order.orderStatus === 'Out for Delivery') && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-amber-800 mb-1.5">🔑 Enter Delivery OTP (from customer) to mark Delivered:</p>
                            <input
                              type="text"
                              maxLength={6}
                              value={deliveryOTPInputs[order._id] || ''}
                              onChange={e => setDeliveryOTPInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                              placeholder="6-digit OTP"
                              className="border border-amber-300 rounded-lg px-3 py-1.5 text-sm font-bold w-36 outline-none focus:ring-2 focus:ring-amber-400 bg-white tracking-widest"
                            />
                          </div>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                          >
                            Confirm Delivered ✓
                          </button>
                        </div>
                      )}

                      {/* Delivery OTP info for Shipped orders */}
                      {order.deliveryOTP && order.orderStatus !== 'Delivered' && (
                        <p className="text-[10px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                          📧 Delivery OTP was emailed to customer when order was Shipped. Customer shares OTP to confirm receipt.
                          {order.isDeliveryOTPVerified ? ' ✅ Already verified.' : ''}
                        </p>
                      )}
                    </div>

                    {/* Return Request Handling */}
                    {order.returnRequest?.isRequested && (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-rose-900 text-sm">Return Request</span>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                            order.returnRequest.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            order.returnRequest.status === 'Approved' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            order.returnRequest.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>{order.returnRequest.status}</span>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-rose-100 space-y-1">
                          <p><strong>Reason:</strong> {order.returnRequest.reason}</p>
                          {order.returnRequest.details && <p><strong>Details:</strong> {order.returnRequest.details}</p>}
                          <p><strong>Requested:</strong> {order.returnRequest.requestedAt ? new Date(order.returnRequest.requestedAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                        </div>

                        {/* Photo Proof */}
                        {order.returnRequest.proofImages?.length > 0 && (
                          <div>
                            <p className="font-bold text-rose-800 mb-2">📷 Photo Proof ({order.returnRequest.proofImages.length} images):</p>
                            <div className="flex gap-2 flex-wrap">
                              {order.returnRequest.proofImages.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                  <img src={img} alt={`proof-${i}`} className="w-20 h-20 rounded-lg object-cover border-2 border-rose-300 hover:border-rose-500 transition" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pending: Approve/Reject with pickup days */}
                        {order.returnRequest.status === 'Pending' && (
                          <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <label className="font-semibold text-slate-700">Pickup days:</label>
                              <input
                                type="number"
                                min="1" max="7"
                                value={pickupDaysInputs[order._id] || 2}
                                onChange={e => setPickupDaysInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                                className="border border-slate-300 rounded-lg px-2 py-1 w-16 text-center font-bold outline-none focus:ring-2 focus:ring-emerald-400"
                              />
                            </div>
                            <button onClick={() => handleProcessReturn(order._id, 'Approved')} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition">✓ Approve Return</button>
                            <button onClick={() => handleProcessReturn(order._id, 'Rejected')} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition">✗ Reject</button>
                          </div>
                        )}

                        {/* Approved: Return Pickup OTP verification */}
                        {order.returnRequest.status === 'Approved' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                            <p className="font-bold text-blue-800">📦 Verify Return Pickup OTP (from customer):</p>
                            <p className="text-[10px] text-blue-600">Pickup in {order.returnRequest.estimatedPickupDays || 2} days. Customer has their Return OTP via email.</p>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                maxLength={6}
                                value={returnOTPInputs[order._id] || ''}
                                onChange={e => setReturnOTPInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                                placeholder="Return OTP"
                                className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm font-bold w-36 outline-none focus:ring-2 focus:ring-blue-400 bg-white tracking-widest"
                              />
                              <button
                                onClick={() => handleVerifyReturnOTP(order._id)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                              >
                                Confirm Pickup & Initiate Refund
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Completed: Refund info */}
                        {order.returnRequest.status === 'Completed' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800">
                            ✅ <strong>Refund Initiated</strong> — ₹{order.returnRequest.refundAmount} · Txn: {order.returnRequest.refundTransactionId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ──────────────────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Product Manager</h2>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Product</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Category</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Price</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Stock</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(prod => (
                    <tr key={prod._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={prod.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          <span className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{prod.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{prod.categoryName}</td>
                      <td className="px-4 py-3 font-extrabold text-amber-700">₹{prod.price}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${prod.stock <= 5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">No products found. Add your first product!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES TAB ────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Category Manager</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div key={cat._id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
                  <img src={cat.image} alt={cat.name} className="w-full h-24 object-cover rounded-xl" />
                  <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 hover:underline"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COUPONS TAB ───────────────────────────────────── */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Coupon & Promo Manager</h2>
              <button
                onClick={() => setShowCouponModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Code</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Discount</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Min Order</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Expiry</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Used</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map(coupon => (
                    <tr key={coupon._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-extrabold text-amber-700 tracking-wider">{coupon.code}</td>
                      <td className="px-4 py-3 font-bold text-slate-700 capitalize">{coupon.discountType}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">₹{coupon.minOrderValue}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-slate-600">{coupon.usedCount} / {coupon.usageLimit}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">No coupons found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BANNERS & CARDS TAB ────────────────────────────────────────── */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Image className="w-5 h-5 text-amber-600" /> Homepage Banners & Pre-Footer Cards
                </h2>
                <p className="text-xs text-slate-500">Manage hero slider cards & pre-footer category cards linked to category pages</p>
              </div>
              <button
                onClick={() => {
                  setBannerForm({ title: '', subtitle: '', ctaText: 'Shop Collection', categorySlug: '', image: '', type: 'hero' });
                  setShowBannerModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Plus className="w-4 h-4" /> Add New Banner / Promo Card
              </button>
            </div>

            {/* Section 1: Hero Carousel Banners (Below Navbar) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Hero Carousel Cards (Below Navbar)
                </h3>
                <span className="text-xs font-semibold text-slate-500">{heroBannersData?.banners?.length || 0} Banners Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {heroBannersData?.banners?.map(b => (
                  <div key={b._id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-3">
                    <img src={b.image} alt={b.title} className="w-full h-32 object-cover rounded-xl border" />
                    <div className="space-y-1">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Hero Carousel</span>
                      <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{b.title}</h4>
                      <p className="text-slate-500 line-clamp-2 text-[11px]">{b.subtitle}</p>
                      <p className="text-amber-700 font-bold text-[10px]">🔗 Category: {b.categorySlug || 'All Products'}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <button
                        onClick={() => handleOpenEditBanner(b)}
                        className="text-amber-600 hover:text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b._id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Pre-Footer Category Promo Cards */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" /> Pre-Footer Category Cards (Before Footer)
                </h3>
                <span className="text-xs font-semibold text-slate-500">{promoBannersData?.banners?.length || 0} Cards Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {promoBannersData?.banners?.map(b => (
                  <div key={b._id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-3">
                    <img src={b.image} alt={b.title} className="w-full h-32 object-cover rounded-xl border" />
                    <div className="space-y-1">
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Pre-Footer Card</span>
                      <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{b.title}</h4>
                      <p className="text-slate-500 line-clamp-2 text-[11px]">{b.subtitle}</p>
                      <p className="text-amber-700 font-bold text-[10px]">🔗 Target Category: {b.categorySlug || 'All Products'}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <button
                        onClick={() => handleOpenEditBanner(b)}
                        className="text-amber-600 hover:text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b._id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(!promoBannersData?.banners || promoBannersData.banners.length === 0) && (
                  <p className="text-slate-400 col-span-3 text-center py-6">No pre-footer cards added yet. Click "+ Add New Banner / Promo Card" to add pre-footer category cards.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CORPORATE LEADS TAB ───────────────────────────── */}
        {activeTab === 'corporate' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">Corporate & Bulk Gifting Leads</h2>
            <div className="space-y-4">
              {corporateLeads.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-slate-400">No corporate inquiries yet.</div>
              ) : corporateLeads.map(lead => (
                <div key={lead._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-slate-500 block">Company</span><span className="font-bold text-slate-900">{lead.companyName}</span></div>
                    <div><span className="text-slate-500 block">Contact</span><span className="font-bold text-slate-900">{lead.contactPerson}</span></div>
                    <div><span className="text-slate-500 block">Email</span><span className="font-bold text-slate-900 truncate">{lead.email}</span></div>
                    <div><span className="text-slate-500 block">Quantity</span><span className="font-extrabold text-amber-700">{lead.quantity} units</span></div>
                    {lead.notes && <div className="col-span-full"><span className="text-slate-500 block">Notes</span><span className="text-slate-700">{lead.notes}</span></div>}
                  </div>
                  <div className="mt-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'Contacted' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>{lead.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOW STOCK TAB ─────────────────────────────────── */}
        {activeTab === 'lowstock' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Low Stock Alert Panel
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-10 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-bold text-slate-900">All products are well-stocked!</p>
                </div>
              ) : lowStockProducts.map(prod => (
                <div key={prod._id} className="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={prod.images?.[0]} alt={prod.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                      <p className="text-[11px] text-slate-500">{prod.categoryName}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-bold text-rose-700">⚠ Only {prod.stock} left</span>
                    <span className="font-extrabold text-slate-900">₹{prod.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS TAB ──────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Registered Users</h2>
                <p className="text-xs text-slate-500 mt-0.5">{allUsers.length} users signed up on the platform</p>
              </div>
              <button onClick={refetchUsers} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {allUsers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">No users registered yet.</p>
                </div>
              ) : allUsers.map(u => (
                <div key={u._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {u.photo ? (
                        <img src={u.photo} alt={u.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-200" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xl font-black flex items-center justify-center">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{u.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3" />{u.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3" />{u.phone || '—'}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Address</p>
                        {u.addresses && u.addresses.length > 0 ? (
                          <div className="text-xs text-slate-600 flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                            <span className="line-clamp-2">
                              {u.addresses[0].line1}, {u.addresses[0].city}, {u.addresses[0].state} — {u.addresses[0].pincode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No address saved</span>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Orders & Spending</p>
                        <p className="text-xl font-black text-amber-700">{u.orderStats?.totalOrders || 0}</p>
                        <p className="text-xs text-slate-500">orders · ₹{(u.orderStats?.totalSpent || 0).toLocaleString('en-IN')} spent</p>
                        {u.orderStats?.lastOrderDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Last: {new Date(u.orderStats.lastOrderDate).toLocaleDateString('en-IN')}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Loyalty & Joined</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm font-bold text-slate-800">{u.loyaltyPoints || 0} pts</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {u.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
                        </span>
                      </div>
                    </div>

                    {/* View Orders Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleViewUserOrders(u)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition"
                      >
                        <Eye className="w-4 h-4" /> View Orders
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUPPORT & HELP DESK TAB ───────────────────────── */}
        {activeTab === 'support_tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Customer Help & Support Tickets</h2>
                <p className="text-xs text-slate-500 mt-0.5">{supportTickets.length} support requests submitted by customers</p>
              </div>
              <button onClick={refetchSupportTickets} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition self-start sm:self-auto">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {supportTickets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
                <Headphones className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No support tickets submitted yet.</p>
                <p className="text-xs text-slate-400">Customer inquiries from Help Center will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {supportTickets.map(ticket => (
                  <div key={ticket._id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          #{ticket.ticketId}
                        </span>
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          {ticket.category}
                        </span>
                        {ticket.orderId && (
                          <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                            Order: {ticket.orderId}
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          ticket.status === 'Responded' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800' :
                          ticket.status === 'Closed' ? 'bg-slate-100 text-slate-700' :
                          'bg-amber-100 text-amber-900 animate-pulse'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Customer Details</span>
                        <p className="font-bold text-slate-900 text-sm">{ticket.name}</p>
                        <p className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-600" /> {ticket.email}</p>
                      </div>

                      <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Customer Message</span>
                        <p className="text-slate-800 leading-relaxed">{ticket.message}</p>
                        {ticket.attachmentUrl && (
                          <a href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline pt-1">
                            <ExternalLink className="w-3.5 h-3.5" /> View Attachment
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Admin Response Box (if exists) */}
                    {ticket.adminResponse && (
                      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-emerald-900 font-bold">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Admin Response ({ticket.respondedBy || 'Support Desk'})</span>
                          <span className="text-[10px] text-emerald-700 font-normal">
                            {ticket.respondedAt ? new Date(ticket.respondedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-emerald-950 leading-relaxed">{ticket.adminResponse}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedTicketModal(ticket);
                          setTicketReplyText(ticket.adminResponse || '');
                          setTicketStatusInput(ticket.status || 'Responded');
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> {ticket.adminResponse ? 'Update Response / Status' : 'Reply to Ticket'}
                      </button>

                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete ticket #${ticket.ticketId}?`)) return;
                          try {
                            await API.delete(`/content/support-tickets/${ticket._id}`);
                            toast.success('Ticket deleted');
                            refetchSupportTickets();
                          } catch {
                            toast.error('Failed to delete ticket');
                          }
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── JOB APPLICATIONS TAB ───────────────────────────── */}
        {activeTab === 'job_applications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Careers & Job Applications</h2>
                <p className="text-xs text-slate-500 mt-0.5">{jobApplications.length} candidate applications submitted</p>
              </div>
              <button onClick={refetchJobApplications} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition self-start sm:self-auto">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {jobApplications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No applications received yet.</p>
                <p className="text-xs text-slate-400">Applications from the Careers page will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobApplications.map(app => (
                  <div key={app._id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          #{app.applicationId}
                        </span>
                        <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          Role: {app.roleApplied}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          app.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'Under Review' ? 'bg-amber-100 text-amber-900' :
                          app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-700 font-bold'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Candidate Details</span>
                        <p className="font-bold text-slate-900 text-sm">{app.fullName}</p>
                        <p className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-600" /> {app.email}</p>
                        <p className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-600" /> {app.phone}</p>
                      </div>

                      <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Cover Note & Resume</span>
                        <p className="text-slate-800 leading-relaxed">{app.coverNote || 'No cover note provided.'}</p>
                        {app.portfolioUrl && (
                          <div className="pt-1">
                            <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg hover:bg-amber-200 transition text-[11px]">
                              <ExternalLink className="w-3 h-3" /> View Portfolio / Resume Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {app.adminNotes && (
                      <div className="bg-slate-100 p-3.5 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">Recruitment Notes ({app.reviewedBy || 'HR Team'}):</span>
                        <p className="text-slate-600">{app.adminNotes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedAppModal(app);
                          setAppNotesInput(app.adminNotes || '');
                          setAppStatusInput(app.status || 'Under Review');
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Review / Update Status
                      </button>

                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete application for ${app.fullName}?`)) return;
                          try {
                            await API.delete(`/content/careers/applications/${app._id}`);
                            toast.success('Application deleted');
                            refetchJobApplications();
                          } catch {
                            toast.error('Failed to delete application');
                          }
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GRIEVANCES TAB ─────────────────────────────────── */}
        {activeTab === 'grievances' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Grievance Redressal Tickets</h2>
                <p className="text-xs text-slate-500 mt-0.5">{grievancesList.length} formal grievances registered</p>
              </div>
              <button onClick={refetchGrievances} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition self-start sm:self-auto">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {grievancesList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
                <Scale className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No formal grievances registered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {grievancesList.map(grv => (
                  <div key={grv._id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          #{grv.ticketId}
                        </span>
                        <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          {grv.category}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          grv.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          grv.status === 'In Progress' ? 'bg-amber-100 text-amber-900' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {grv.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(grv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Complainant</span>
                        <p className="font-bold text-slate-900 text-sm">{grv.fullName}</p>
                        <p className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-600" /> {grv.email}</p>
                        <p className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-600" /> {grv.phone}</p>
                        {grv.orderId && <p className="font-mono text-slate-700 pt-1">Order: {grv.orderId}</p>}
                      </div>

                      <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Grievance Description</span>
                        <p className="text-slate-800 leading-relaxed">{grv.description}</p>
                        {grv.documentUrl && (
                          <a href={grv.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline pt-1">
                            <ExternalLink className="w-3.5 h-3.5" /> View Supporting Evidence
                          </a>
                        )}
                      </div>
                    </div>

                    {grv.resolutionNotes && (
                      <div className="bg-emerald-50 p-3.5 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-emerald-900">Resolution Notes:</span>
                        <p className="text-emerald-950">{grv.resolutionNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setSelectedGrievanceModal(grv);
                          setGrievanceNotesInput(grv.resolutionNotes || '');
                          setGrievanceStatusInput(grv.status || 'In Progress');
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Update Grievance Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMPANY SETTINGS TAB ───────────────────────────── */}
        {activeTab === 'company_settings' && companySettingsForm && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Company Details, Social Links & Addresses</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details, social URLs, and office addresses in MongoDB. Changes sync across all store pages & footer in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setIsSavingCompanySettings(true);
                  try {
                    await API.put('/content/company-settings', companySettingsForm);
                    toast.success('Company settings & social links saved to Database! ✓');
                    refetchCompanySettings();
                  } catch (err) {
                    toast.error('Failed to save settings');
                  } finally {
                    setIsSavingCompanySettings(false);
                  }
                }}
                disabled={isSavingCompanySettings}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
              >
                <Save className="w-4 h-4" /> {isSavingCompanySettings ? 'Saving to DB...' : 'Save All Settings ✓'}
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingCompanySettings(true);
                try {
                  await API.put('/content/company-settings', companySettingsForm);
                  toast.success('Company settings & social links saved to Database! ✓');
                  refetchCompanySettings();
                } catch (err) {
                  toast.error('Failed to save settings');
                } finally {
                  setIsSavingCompanySettings(false);
                }
              }}
              className="space-y-6"
            >
              {/* 1. Social Media Links */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Official Social Media Links</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">YouTube Channel URL</label>
                    <input
                      type="url"
                      value={companySettingsForm.social?.youtube || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        social: { ...companySettingsForm.social, youtube: e.target.value }
                      })}
                      placeholder="https://youtube.com/@shrimaruti"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Instagram Profile URL</label>
                    <input
                      type="url"
                      value={companySettingsForm.social?.instagram || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        social: { ...companySettingsForm.social, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/shrimaruti"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">LinkedIn Page URL</label>
                    <input
                      type="url"
                      value={companySettingsForm.social?.linkedin || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        social: { ...companySettingsForm.social, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/company/shrimaruti"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Twitter / X URL</label>
                    <input
                      type="url"
                      value={companySettingsForm.social?.twitter || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        social: { ...companySettingsForm.social, twitter: e.target.value }
                      })}
                      placeholder="https://x.com/shrimaruti"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Facebook Page URL</label>
                    <input
                      type="url"
                      value={companySettingsForm.social?.facebook || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        social: { ...companySettingsForm.social, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/shrimaruti"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Customer Support & Helpline Contacts */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Customer Support & Helpline</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Support Email</label>
                    <input
                      type="text"
                      value={companySettingsForm.support?.email || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        support: { ...companySettingsForm.support, email: e.target.value }
                      })}
                      placeholder="e.g. support@shrimaruti.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Helpline Phone Number</label>
                    <input
                      type="text"
                      value={companySettingsForm.support?.phone || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        support: { ...companySettingsForm.support, phone: e.target.value }
                      })}
                      placeholder="e.g. 1800-419-7700"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">WhatsApp Support Number</label>
                    <input
                      type="text"
                      value={companySettingsForm.support?.whatsapp || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        support: { ...companySettingsForm.support, whatsapp: e.target.value }
                      })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Support Operational Hours</label>
                    <input
                      type="text"
                      value={companySettingsForm.support?.hours || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        support: { ...companySettingsForm.support, hours: e.target.value }
                      })}
                      placeholder="e.g. Mon-Sat: 9:00 AM - 8:00 PM IST"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Company Legal Identification */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Brand & Company Legal Entity</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={companySettingsForm.brandName || ''}
                      onChange={e => setCompanySettingsForm({ ...companySettingsForm, brandName: e.target.value })}
                      placeholder="e.g. Shri Maruti"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Legal Entity Name</label>
                    <input
                      type="text"
                      value={companySettingsForm.companyLegalName || ''}
                      onChange={e => setCompanySettingsForm({ ...companySettingsForm, companyLegalName: e.target.value })}
                      placeholder="e.g. Shri Maruti Internet Pvt Ltd"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Corporate CIN</label>
                    <input
                      type="text"
                      value={companySettingsForm.cin || ''}
                      onChange={e => setCompanySettingsForm({ ...companySettingsForm, cin: e.target.value })}
                      placeholder="e.g. U51109UP2026PTC066107"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={companySettingsForm.gstin || ''}
                      onChange={e => setCompanySettingsForm({ ...companySettingsForm, gstin: e.target.value })}
                      placeholder="e.g. 09ABCDE1234F1Z5"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Official Addresses */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Official Registered & Mailing Addresses</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Registered Office */}
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">Registered Office Address</span>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={companySettingsForm.registeredOffice?.line1 || ''}
                        onChange={e => setCompanySettingsForm({
                          ...companySettingsForm,
                          registeredOffice: { ...companySettingsForm.registeredOffice, line1: e.target.value }
                        })}
                        placeholder="e.g. Hazratganj Main Market"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">City</label>
                        <input
                          type="text"
                          value={companySettingsForm.registeredOffice?.city || ''}
                          onChange={e => setCompanySettingsForm({
                            ...companySettingsForm,
                            registeredOffice: { ...companySettingsForm.registeredOffice, city: e.target.value }
                          })}
                          placeholder="Lucknow"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">State</label>
                        <input
                          type="text"
                          value={companySettingsForm.registeredOffice?.state || ''}
                          onChange={e => setCompanySettingsForm({
                            ...companySettingsForm,
                            registeredOffice: { ...companySettingsForm.registeredOffice, state: e.target.value }
                          })}
                          placeholder="UP"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={companySettingsForm.registeredOffice?.pincode || ''}
                          onChange={e => setCompanySettingsForm({
                            ...companySettingsForm,
                            registeredOffice: { ...companySettingsForm.registeredOffice, pincode: e.target.value }
                          })}
                          placeholder="226001"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mailing Address */}
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">Mailing / Customer Care Address</span>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={companySettingsForm.mailingAddress?.line1 || ''}
                        onChange={e => setCompanySettingsForm({
                          ...companySettingsForm,
                          mailingAddress: { ...companySettingsForm.mailingAddress, line1: e.target.value }
                        })}
                        placeholder="e.g. Hazratganj Main Market"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">City</label>
                        <input
                          type="text"
                          value={companySettingsForm.mailingAddress?.city || ''}
                          onChange={e => setCompanySettingsForm({
                            ...companySettingsForm,
                            mailingAddress: { ...companySettingsForm.mailingAddress, city: e.target.value }
                          })}
                          placeholder="Lucknow"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">State</label>
                        <input
                          type="text"
                          value={companySettingsForm.mailingAddress?.state || ''}
                          onChange={e => setCompanySettingsForm({
                            ...companySettingsForm,
                            mailingAddress: { ...companySettingsForm.mailingAddress, state: e.target.value }
                          })}
                          placeholder="UP"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={companySettingsForm.mailingAddress?.pincode || ''}
                          onChange={e => setCompanySettingsForm({
                            ...companySettingsForm,
                            mailingAddress: { ...companySettingsForm.mailingAddress, pincode: e.target.value }
                          })}
                          placeholder="226001"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Recruitment, Press & Grievance Contacts */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Careers, Media & Grievance Officer Contacts</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Recruitment / Careers Email</label>
                    <input
                      type="text"
                      value={companySettingsForm.recruitment?.email || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        recruitment: { ...companySettingsForm.recruitment, email: e.target.value }
                      })}
                      placeholder="e.g. careers@shrimaruti.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Media / Press Contact Name</label>
                    <input
                      type="text"
                      value={companySettingsForm.media?.contactName || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        media: { ...companySettingsForm.media, contactName: e.target.value }
                      })}
                      placeholder="e.g. Corporate Communications Desk"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Media / Press Email</label>
                    <input
                      type="text"
                      value={companySettingsForm.media?.email || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        media: { ...companySettingsForm.media, email: e.target.value }
                      })}
                      placeholder="e.g. media@shrimaruti.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Grievance Officer Name</label>
                    <input
                      type="text"
                      value={companySettingsForm.grievance?.officerName || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        grievance: { ...companySettingsForm.grievance, officerName: e.target.value }
                      })}
                      placeholder="e.g. Mr. Ankit Srivastava"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Grievance Officer Email</label>
                    <input
                      type="text"
                      value={companySettingsForm.grievance?.email || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        grievance: { ...companySettingsForm.grievance, email: e.target.value }
                      })}
                      placeholder="e.g. grievance@shrimaruti.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Grievance Officer Phone</label>
                    <input
                      type="text"
                      value={companySettingsForm.grievance?.phone || ''}
                      onChange={e => setCompanySettingsForm({
                        ...companySettingsForm,
                        grievance: { ...companySettingsForm.grievance, phone: e.target.value }
                      })}
                      placeholder="e.g. 1800-419-7700 (Ext 4)"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Settings Footer Bar */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingCompanySettings}
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {isSavingCompanySettings ? 'Saving Changes...' : 'Save All Company Settings ✓'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ── USER ORDERS MODAL ──────────────────────────────── */}
      {showUserOrdersModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedUser.name}'s Orders</h3>
                <p className="text-xs text-slate-500">{selectedUser.email} • {selectedUser.phone}</p>
              </div>
              <button onClick={() => { setShowUserOrdersModal(false); setSelectedUser(null); }} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {userOrdersData.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                <p className="text-sm font-bold">No orders placed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrdersData.map(order => (
                  <div key={order._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-900">#{order.orderNumber}</span>
                        <span className="ml-2 text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{order.orderStatus}</span>
                        <span className="text-sm font-black text-amber-700">₹{order.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-slate-400">× {item.quantity}</span>
                          <span className="ml-auto font-bold text-slate-700">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Delivery: {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADD PRODUCT MODAL ─────────────────────────────── */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add New Product</h3>
              <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} required className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    value={productForm.price}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setProductForm({...productForm, price: val === '' ? '' : Math.max(0, Number(val))});
                      }
                    }}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    value={productForm.originalPrice}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setProductForm({...productForm, originalPrice: val === '' ? '' : Math.max(0, Number(val))});
                      }
                    }}
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    value={productForm.stock}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setProductForm({...productForm, stock: val === '' ? '' : Math.max(0, Number(val))});
                      }
                    }}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} required className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none" />
                </div>

                {/* ── Product Image Options (Single vs Multiple) ── */}
                <div className="sm:col-span-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      📷 Product Image Options
                    </span>
                    
                    {/* Toggle: Single vs Multiple */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 text-xs font-bold shadow-xs">
                      <button
                        type="button"
                        onClick={() => { setImageOption('single'); setSelectedImageFiles([]); setFilePreviews([]); setImageUrlInputs(['']); }}
                        className={`px-3 py-1 rounded-lg transition ${imageOption === 'single' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Single Image
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImageOption('multiple'); setSelectedImageFiles([]); setFilePreviews([]); setImageUrlInputs(['']); }}
                        className={`px-3 py-1 rounded-lg transition ${imageOption === 'multiple' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Multiple Images
                      </button>
                    </div>
                  </div>

                  {/* Radio Toggle: Device File Upload vs Direct URL Links */}
                  <div className="flex items-center gap-5 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="imageSource" checked={imageSource === 'file'} onChange={() => setImageSource('file')} className="accent-amber-600" />
                      Upload File(s)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="imageSource" checked={imageSource === 'url'} onChange={() => setImageSource('url')} className="accent-amber-600" />
                      Image URL Link(s)
                    </label>
                  </div>

                  {/* Device File Input */}
                  {imageSource === 'file' && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple={imageOption === 'multiple'}
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                      />
                      {filePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {filePreviews.map((src, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500 shadow-sm group">
                              <img src={src} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white p-0.5 rounded-full text-[10px] hover:bg-rose-700 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Direct URL Inputs */}
                  {imageSource === 'url' && (
                    <div className="space-y-2">
                      {imageUrlInputs.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleUrlChange(idx, e.target.value)}
                            placeholder={imageOption === 'single' ? 'Enter Image URL (https://...)' : `Image URL #${idx + 1}`}
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none bg-white"
                          />
                          {imageOption === 'multiple' && imageUrlInputs.length > 1 && (
                            <button type="button" onClick={() => removeUrlInput(idx)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {imageOption === 'multiple' && (
                        <button
                          type="button"
                          onClick={addUrlInput}
                          className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
                        >
                          + Add Another Image URL
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {/* ── Return & Refund Policy Options ── */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    🛡️ Return & Refund Policy Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Policy Type *</label>
                      <select
                        value={productForm.policyType}
                        onChange={e => setProductForm({...productForm, policyType: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-semibold"
                      >
                        <option value="Return">Return Policy</option>
                        <option value="Refund">Refund Policy</option>
                        <option value="Replacement">Replacement Policy</option>
                        <option value="No Return/Refund">No Return / No Refund</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Policy Duration (Days: 0 to 7 max) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={productForm.returnPolicyDays}
                        onChange={e => {
                          const val = Math.min(7, Math.max(0, Number(e.target.value) || 0));
                          setProductForm({...productForm, returnPolicyDays: val});
                        }}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-amber-700 bg-white"
                        placeholder="e.g. 7"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Positive integer, maximum 7 days limit.
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Policy Terms & Conditions
                      </label>
                      <textarea
                        rows={2}
                        value={productForm.policyTerms}
                        onChange={e => setProductForm({...productForm, policyTerms: e.target.value})}
                        placeholder="Enter specific return/refund terms & conditions for this product..."
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input type="checkbox" checked={productForm.isBestseller} onChange={e => setProductForm({...productForm, isBestseller: e.target.checked})} className="accent-amber-600" />
                    Bestseller Badge
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input type="checkbox" checked={productForm.isTrending} onChange={e => setProductForm({...productForm, isTrending: e.target.checked})} className="accent-amber-600" />
                    Trending
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition">Save Product</button>
                <button type="button" onClick={() => setShowProductModal(false)} className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE COUPON MODAL ───────────────────────────── */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Create Discount Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Coupon Code *</label>
                  <input type="text" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required placeholder="e.g. DIWALI20" className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-bold tracking-widest uppercase" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Discount Value *</label>
                  <input type="number" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} required className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Min Order Value (₹)</label>
                  <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({...couponForm, minOrderValue: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date *</label>
                  <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})} required className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md">Create Coupon</button>
                <button type="button" onClick={() => setShowCouponModal(false)} className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE CATEGORY MODAL ─────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add New Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Name *</label>
                <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required placeholder="e.g. Handmade Flowers" className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <input type="text" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Short description of this category..." className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none" />
              </div>

              {/* Category Image Upload / URL Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Image *</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setCategoryImageSource('file')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${categoryImageSource === 'file' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    📁 Upload Image File
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryImageSource('url')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${categoryImageSource === 'url' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    🔗 Image URL
                  </button>
                </div>

                {categoryImageSource === 'file' ? (
                  <div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setCategoryImageFile(file);
                            setCategoryImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <Upload className="w-7 h-7 text-amber-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold text-slate-700">Click or drag image file here</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (Max 5MB) • Saves directly to Cloudinary</span>
                    </label>

                    {categoryImagePreview && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 h-28 group shadow-sm">
                        <img src={categoryImagePreview} alt="Category preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <button
                            type="button"
                            onClick={() => { setCategoryImageFile(null); setCategoryImagePreview(''); }}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow hover:bg-red-700"
                          >
                            Remove / Change
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          ☁️ Saved to Cloudinary DB
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={categoryForm.image}
                      onChange={e => setCategoryForm({...categoryForm, image: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                    />
                    {categoryForm.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-24">
                        <img src={categoryForm.image} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSubmittingCategory ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...
                    </>
                  ) : (
                    '✨ Add Category'
                  )}
                </button>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD BANNER / PROMO CARD MODAL ───────────────────────────── */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5 my-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Add Homepage Banner / Card</h3>
                <p className="text-xs text-slate-400 mt-0.5">Clicking the card will navigate to the selected category page</p>
              </div>
              <button onClick={() => setShowBannerModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              {/* Card Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Card Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition text-xs font-bold ${bannerForm.type === 'hero' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <input type="radio" name="bannerType" value="hero" checked={bannerForm.type === 'hero'} onChange={e => setBannerForm({...bannerForm, type: e.target.value})} className="accent-amber-600" />
                    <div>
                      <span className="block">🎠 Hero Carousel</span>
                      <span className="text-[10px] font-normal text-slate-400">Shown below navbar, slider</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition text-xs font-bold ${bannerForm.type === 'promo' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <input type="radio" name="bannerType" value="promo" checked={bannerForm.type === 'promo'} onChange={e => setBannerForm({...bannerForm, type: e.target.value})} className="accent-indigo-600" />
                    <div>
                      <span className="block">🎴 Pre-Footer Card</span>
                      <span className="text-[10px] font-normal text-slate-400">Category cards above footer</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title / Headline *</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                  required
                  placeholder="e.g. Send Love With Fresh Flowers"
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  placeholder="Short description shown below the headline..."
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* CTA Text */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={bannerForm.ctaText}
                  onChange={e => setBannerForm({...bannerForm, ctaText: e.target.value})}
                  placeholder="e.g. Shop Collection"
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Slug */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Link to Category <span className="text-slate-400 font-normal">(clicking card opens this category's products)</span>
                </label>
                <select
                  value={bannerForm.categorySlug}
                  onChange={e => setBannerForm({...bannerForm, categorySlug: e.target.value})}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white focus:border-amber-400 font-semibold"
                >
                  <option value="">— All Products (no specific category) —</option>
                  {(categoriesData?.categories || []).map(cat => (
                    <option key={cat._id} value={cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {bannerForm.categorySlug && (
                  <p className="text-[10px] text-amber-700 font-semibold mt-1">
                    🔗 Will link to: /products?category={bannerForm.categorySlug}
                  </p>
                )}
              </div>

              {/* Banner Image Upload / URL Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banner Image *</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setBannerImageSource('file')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${bannerImageSource === 'file' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    📁 Upload Image File
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerImageSource('url')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${bannerImageSource === 'url' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    🔗 Image URL
                  </button>
                </div>

                {bannerImageSource === 'file' ? (
                  <div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setBannerImageFile(file);
                            setBannerImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <Upload className="w-7 h-7 text-amber-600 group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold text-slate-700">Click or drag banner image file here</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (Max 5MB) • Saves directly to Cloudinary</span>
                    </label>

                    {bannerImagePreview && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 h-32 group shadow-sm">
                        <img src={bannerImagePreview} alt="Banner preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <button
                            type="button"
                            onClick={() => { setBannerImageFile(null); setBannerImagePreview(''); }}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow hover:bg-red-700"
                          >
                            Remove / Change
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          ☁️ Saved to Cloudinary DB
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={bannerForm.image}
                      onChange={e => setBannerForm({...bannerForm, image: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                    />
                    {bannerForm.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-28">
                        <img src={bannerForm.image} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingBanner}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSubmittingBanner ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...
                    </>
                  ) : (
                    '✨ Publish Banner Card'
                  )}
                </button>
                <button type="button" onClick={() => setShowBannerModal(false)} className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ── EDIT PRODUCT MODAL ───────────────────────────── */}
      {showEditProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Product</h3>
                <p className="text-xs text-slate-400">Update product details, pricing, stock, policy, or images</p>
              </div>
              <button onClick={() => setShowEditProductModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={editProductForm.name}
                    onChange={e => setEditProductForm({ ...editProductForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={editProductForm.categoryId}
                    onChange={e => setEditProductForm({ ...editProductForm, categoryId: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white focus:border-amber-400"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={editProductForm.price}
                    onChange={e => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editProductForm.originalPrice}
                    onChange={e => setEditProductForm({ ...editProductForm, originalPrice: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={editProductForm.stock}
                    onChange={e => setEditProductForm({ ...editProductForm, stock: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={editProductForm.description}
                    onChange={e => setEditProductForm({ ...editProductForm, description: e.target.value })}
                    required
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  />
                </div>

                {/* Existing Images Display */}
                {editExistingImages.length > 0 && (
                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Current Saved Images:</span>
                    <div className="flex flex-wrap gap-2">
                      {editExistingImages.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                          <img src={img} alt="Current product image" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="sm:col-span-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      📷 Upload New Images (Optional)
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editReplaceImages}
                        onChange={e => setEditReplaceImages(e.target.checked)}
                        className="accent-amber-600"
                      />
                      Replace all current images
                    </label>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditProductFileChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                  />

                  {editFilePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {editFilePreviews.map((src, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500 shadow-sm">
                          <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Policy Configuration */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    🛡️ Return & Refund Policy
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Policy Type</label>
                      <select
                        value={editProductForm.policyType}
                        onChange={e => setEditProductForm({ ...editProductForm, policyType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-semibold"
                      >
                        <option value="Return">Return Policy</option>
                        <option value="Refund">Refund Policy</option>
                        <option value="Replacement">Replacement Policy</option>
                        <option value="No Return/Refund">No Return / No Refund</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Policy Duration (Days: 0 to 7)</label>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={editProductForm.returnPolicyDays}
                        onChange={e => {
                          const val = Math.min(7, Math.max(0, Number(e.target.value) || 0));
                          setEditProductForm({ ...editProductForm, returnPolicyDays: val });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-amber-700 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Policy Terms & Conditions</label>
                      <textarea
                        rows={2}
                        value={editProductForm.policyTerms}
                        onChange={e => setEditProductForm({ ...editProductForm, policyTerms: e.target.value })}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editProductForm.isBestseller}
                      onChange={e => setEditProductForm({ ...editProductForm, isBestseller: e.target.checked })}
                      className="accent-amber-600"
                    />
                    Bestseller Badge
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editProductForm.isTrending}
                      onChange={e => setEditProductForm({ ...editProductForm, isTrending: e.target.checked })}
                      className="accent-amber-600"
                    />
                    Trending
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditProduct}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSubmittingEditProduct ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Save Product Changes ✓'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT CATEGORY MODAL ───────────────────────────── */}
      {showEditCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Category</h3>
                <p className="text-xs text-slate-400">Update category details or change its image</p>
              </div>
              <button onClick={() => setShowEditCategoryModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  value={editCategoryForm.name}
                  onChange={e => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={editCategoryForm.description}
                  onChange={e => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Display Order</label>
                <input
                  type="number"
                  value={editCategoryForm.displayOrder}
                  onChange={e => setEditCategoryForm({ ...editCategoryForm, displayOrder: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              {/* Current Image */}
              {editCategoryForm.image && !editCategoryImagePreview && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Current Image:</span>
                  <div className="h-24 rounded-xl overflow-hidden border border-slate-200">
                    <img src={editCategoryForm.image} alt="Category preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Upload Replacement Image */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Change Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditCategoryImageFile(file);
                      setEditCategoryImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                {editCategoryImagePreview && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border-2 border-amber-500 shadow-sm">
                    <img src={editCategoryImagePreview} alt="New preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditCategory}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSubmittingEditCategory ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Save Category ✓'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT BANNER MODAL ───────────────────────────── */}
      {showEditBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5 my-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Banner / Card</h3>
                <p className="text-xs text-slate-400">Update headline, CTA, category target, or image</p>
              </div>
              <button onClick={() => setShowEditBannerModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateBanner} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Card Type</label>
                <select
                  value={editBannerForm.type}
                  onChange={e => setEditBannerForm({ ...editBannerForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white font-semibold"
                >
                  <option value="hero">Hero Carousel (Below Navbar)</option>
                  <option value="promo">Pre-Footer Card (Above Footer)</option>
                  <option value="story">Brand Story Banner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title / Headline *</label>
                <input
                  type="text"
                  value={editBannerForm.title}
                  onChange={e => setEditBannerForm({ ...editBannerForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={editBannerForm.subtitle}
                  onChange={e => setEditBannerForm({ ...editBannerForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={editBannerForm.ctaText}
                  onChange={e => setEditBannerForm({ ...editBannerForm, ctaText: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link to Category</label>
                <select
                  value={editBannerForm.categorySlug}
                  onChange={e => setEditBannerForm({ ...editBannerForm, categorySlug: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none bg-white focus:border-amber-400 font-semibold"
                >
                  <option value="">— All Products (no specific category) —</option>
                  {(categoriesData?.categories || []).map(cat => (
                    <option key={cat._id} value={cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Image */}
              {editBannerForm.image && !editBannerImagePreview && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Current Banner Image:</span>
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img src={editBannerForm.image} alt="Banner preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Upload Replacement Image */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Change Banner Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditBannerImageFile(file);
                      setEditBannerImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                {editBannerImagePreview && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border-2 border-amber-500 shadow-sm">
                    <img src={editBannerImagePreview} alt="New banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditBanner}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSubmittingEditBanner ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Save Banner ✓'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditBannerModal(false)}
                  className="py-3 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX MODAL */}
      {selectedScreenshotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Payment Proof Screenshot</h3>
              <button onClick={() => setSelectedScreenshotModal(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 p-2 bg-slate-900">
              <img src={selectedScreenshotModal} alt="Full resolution payment screenshot" className="w-full h-auto object-contain mx-auto rounded-xl" />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedScreenshotModal(null)} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Reject Payment
              </h3>
              <button onClick={() => setRejectModalPayment(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-xs text-slate-600">
              Please enter the reason for rejecting payment submission for Order #{rejectModalPayment.orderId?.orderNumber || ''}:
            </p>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={e => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Payment screenshot is unclear or UTR mismatch"
              className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:border-rose-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await API.patch(`/admin/payments/${rejectModalPayment._id}/reject`, {
                      rejectionReason: rejectionReasonInput
                    });
                    toast.success('Payment rejected. Notification sent to customer.');
                    setRejectModalPayment(null);
                    refetchPendingPayments();
                    refetchOrders();
                  } catch (err) {
                    toast.error('Failed to reject payment');
                  }
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Reject Payment
              </button>
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="py-3 px-5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT TICKET RESPONSE MODAL */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-amber-600" /> Support Ticket #{selectedTicketModal.ticketId}
                </h3>
                <p className="text-xs text-slate-500">{selectedTicketModal.name} • {selectedTicketModal.email}</p>
              </div>
              <button onClick={() => setSelectedTicketModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-amber-800">Category: {selectedTicketModal.category}</span>
                {selectedTicketModal.orderId && <span className="font-mono text-slate-700">Order: {selectedTicketModal.orderId}</span>}
              </div>
              <p className="text-slate-800 leading-relaxed font-normal">{selectedTicketModal.message}</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingTicket(true);
                try {
                  await API.put(`/content/support-tickets/${selectedTicketModal._id}/respond`, {
                    adminResponse: ticketReplyText,
                    status: ticketStatusInput
                  });
                  toast.success('Support ticket response saved! ✓');
                  setSelectedTicketModal(null);
                  refetchSupportTickets();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to save response');
                } finally {
                  setIsSavingTicket(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ticket Status</label>
                <select
                  value={ticketStatusInput}
                  onChange={e => setTicketStatusInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Responded">Responded</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Response / Resolution Message *</label>
                <textarea
                  rows={4}
                  value={ticketReplyText}
                  onChange={e => setTicketReplyText(e.target.value)}
                  required
                  placeholder="Type your response to the customer's support inquiry..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingTicket}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {isSavingTicket ? 'Saving Response...' : 'Save & Send Response ✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicketModal(null)}
                  className="py-3 px-5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOB APPLICATION REVIEW MODAL */}
      {selectedAppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-600" /> Candidate Application #{selectedAppModal.applicationId}
                </h3>
                <p className="text-xs text-slate-500">{selectedAppModal.fullName} • {selectedAppModal.email} • {selectedAppModal.phone}</p>
              </div>
              <button onClick={() => setSelectedAppModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-indigo-900 block">Applied Role: {selectedAppModal.roleApplied}</span>
              <p className="text-slate-800 leading-relaxed font-normal">{selectedAppModal.coverNote || 'No cover note.'}</p>
              {selectedAppModal.portfolioUrl && (
                <a href={selectedAppModal.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline pt-1">
                  <ExternalLink className="w-3.5 h-3.5" /> View Candidate Portfolio / Resume Link
                </a>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingApp(true);
                try {
                  await API.put(`/content/careers/applications/${selectedAppModal._id}`, {
                    status: appStatusInput,
                    adminNotes: appNotesInput
                  });
                  toast.success('Applicant status and notes updated! ✓');
                  setSelectedAppModal(null);
                  refetchJobApplications();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to update application');
                } finally {
                  setIsSavingApp(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recruitment Status</label>
                <select
                  value={appStatusInput}
                  onChange={e => setAppStatusInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Internal HR & Interview Notes</label>
                <textarea
                  rows={3}
                  value={appNotesInput}
                  onChange={e => setAppNotesInput(e.target.value)}
                  placeholder="e.g. Cleared round 1 technical interview, scheduled founder round on Friday..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingApp}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> {isSavingApp ? 'Updating Candidate...' : 'Save Applicant Status ✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAppModal(null)}
                  className="py-3 px-5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRIEVANCE RESOLUTION MODAL */}
      {selectedGrievanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" /> Grievance #{selectedGrievanceModal.ticketId}
                </h3>
                <p className="text-xs text-slate-500">{selectedGrievanceModal.fullName} • {selectedGrievanceModal.email}</p>
              </div>
              <button onClick={() => setSelectedGrievanceModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-rose-900 block">Category: {selectedGrievanceModal.category}</span>
              <p className="text-slate-800 leading-relaxed font-normal">{selectedGrievanceModal.description}</p>
              {selectedGrievanceModal.documentUrl && (
                <a href={selectedGrievanceModal.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 font-bold hover:underline pt-1">
                  <ExternalLink className="w-3.5 h-3.5" /> View Supporting Evidence
                </a>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingGrievance(true);
                try {
                  await API.put(`/content/grievances/${selectedGrievanceModal._id}`, {
                    status: grievanceStatusInput,
                    resolutionNotes: grievanceNotesInput
                  });
                  toast.success('Grievance status and resolution notes updated! ✓');
                  setSelectedGrievanceModal(null);
                  refetchGrievances();
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to update grievance');
                } finally {
                  setIsSavingGrievance(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Grievance Status</label>
                <select
                  value={grievanceStatusInput}
                  onChange={e => setGrievanceStatusInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Received">Received</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Grievance Officer Resolution Notes</label>
                <textarea
                  rows={3}
                  value={grievanceNotesInput}
                  onChange={e => setGrievanceNotesInput(e.target.value)}
                  placeholder="e.g. Investigated parcel transit issue with courier partner, issued replacement..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingGrievance}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> {isSavingGrievance ? 'Saving...' : 'Save Grievance Resolution ✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGrievanceModal(null)}
                  className="py-3 px-5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
