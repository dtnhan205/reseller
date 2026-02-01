export type TranslationKey = 
  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.search'
  | 'common.close'
  | 'common.filter'
  | 'common.noData'
  | 'common.select'
  
  // Auth
  | 'auth.login'
  | 'auth.logout'
  | 'auth.email'
  | 'auth.password'
  | 'auth.loginButton'
  | 'auth.welcome'
  | 'auth.username'
  | 'auth.authenticate'
  | 'auth.enterUsername'
  | 'auth.enterPassword'
  | 'auth.enterBoth'
  | 'auth.loginFailed'
  | 'auth.loginSuccess'
  
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.balance'
  | 'dashboard.welcome'
  
  // Navigation
  | 'nav.generate'
  | 'nav.stats'
  | 'nav.history'
  | 'nav.transactions'
  | 'nav.topup'
  
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.balance'
  | 'dashboard.welcome'
  
  // Generate Page
  | 'generate.title'
  | 'generate.subtitle'
  | 'generate.selectProduct'
  | 'generate.searchProducts'
  | 'generate.noProducts'
  | 'generate.noProductsAvailable'
  | 'generate.outOfStock'
  | 'generate.purchaseDetails'
  | 'generate.selectProductToPurchase'
  | 'generate.quantity'
  | 'generate.maxAvailable'
  | 'generate.pricePerKey'
  | 'generate.total'
  | 'generate.yourBalance'
  | 'generate.insufficientBalance'
  | 'generate.generateKeys'
  | 'generate.processing'
  | 'generate.stock'
  | 'generate.keysGenerated'
  | 'generate.key'
  | 'generate.purchased'
  | 'generate.copyAllKeys'
  
  // Stats Page
  | 'stats.title'
  | 'stats.subtitle'
  | 'stats.totalKeys'
  | 'stats.totalSpent'
  | 'stats.avgPrice'
  | 'stats.productStatistics'
  | 'stats.purchased'
  | 'stats.revenue'
  | 'stats.noStatistics'
  
  // History Page
  | 'history.title'
  | 'history.subtitle'
  | 'history.downloadCSV'
  | 'history.searchPlaceholder'
  | 'history.noHistory'
  | 'history.noResults'
  | 'history.showing'
  | 'history.of'
  | 'history.orders'
  | 'history.copyKey'
  | 'history.copied'
  | 'history.requestReset'
  | 'history.resetRequested'
  | 'history.resetPending'
  | 'history.resetApproved'
  | 'history.resetRejected'
  
  // Topup Page
  | 'topup.title'
  | 'topup.subtitle'
  | 'topup.currentBalance'
  | 'topup.addFunds'
  | 'topup.amount'
  | 'topup.quickAmount'
  | 'topup.newBalance'
  | 'topup.topupWallet'
  | 'topup.processing'
  | 'topup.paymentCreated'
  | 'topup.bankInfo'
  | 'topup.bankName'
  | 'topup.accountNumber'
  | 'topup.accountHolder'
  | 'topup.transferContent'
  | 'topup.copyContent'
  | 'topup.copyContent'
  | 'topup.copied'
  | 'topup.pendingPayment'
  | 'topup.expiresAt'
  | 'topup.status'
  | 'topup.statusPending'
  | 'topup.statusCompleted'
  | 'topup.statusExpired'
  | 'topup.transferNote'
  | 'topup.scanQR'
  | 'topup.qrNote'
  | 'topup.paymentCompleted'
  | 'topup.exchangeRate'
  | 'topup.amountUSD'
  | 'topup.amountVND'
  | 'topup.enterAmountUSD'
  | 'topup.amountToPay'
  
  // Transactions Page
  | 'transactions.title'
  | 'transactions.subtitle'
  | 'transactions.totalTopup'
  | 'transactions.thisMonth'
  | 'transactions.history'
  | 'transactions.noHistory'
  | 'transactions.total'
  | 'transactions.transaction'
  | 'transactions.transactions'
  
  // Admin
  | 'admin.dashboard'
  | 'admin.managePlatform'
  | 'admin.sellers'
  | 'admin.categories'
  | 'admin.products'
  | 'admin.inventory'
  | 'admin.bankAccounts'
  | 'admin.exchangeRate'
  | 'admin.createSeller'
  | 'admin.createCategory'
  | 'admin.createProduct'
  | 'admin.addInventory'
  | 'admin.createBankAccount'
  | 'admin.bankAccountsList'
  | 'admin.bankName'
  | 'admin.accountNumber'
  | 'admin.accountHolder'
  | 'admin.apiUrl'
  | 'admin.isActive'
  | 'admin.active'
  | 'admin.inactive'
  | 'admin.noBankAccounts'
  | 'admin.sellersList'
  | 'admin.categoriesList'
  | 'admin.productsList'
  | 'admin.email'
  | 'admin.password'
  | 'admin.categoryName'
  | 'admin.imageUrl'
  | 'admin.optional'
  | 'admin.preview'
  | 'admin.productName'
  | 'admin.price'
  | 'admin.selectCategory'
  | 'admin.selectProduct'
  | 'admin.keys'
  | 'admin.onePerLine'
  | 'admin.keysEntered'
  | 'admin.adding'
  | 'admin.noSellers'
  | 'admin.noCategories'
  | 'admin.noProducts'
  | 'admin.noSearchResults'
  | 'admin.totalSellers'
  | 'admin.totalCategories'
  | 'admin.totalProducts'
  | 'admin.totalSold'
  | 'admin.stock'
  | 'admin.sold'
  | 'admin.selectProductAndKeys'
  | 'admin.confirmDeleteCategory'
  | 'admin.confirmDeleteProduct'
  | 'admin.confirmDeleteBankAccount'
  | 'admin.updating'
  | 'admin.updateRate'
  | 'admin.balance'
  | 'admin.totalTopup'
  | 'admin.topup'
  | 'admin.history'
  | 'admin.topupSeller'
  | 'admin.seller'
  | 'admin.amountUSD'
  | 'admin.note'
  | 'admin.notePlaceholder'
  | 'admin.newBalance'
  | 'admin.topupHistory'
  | 'admin.noTopupHistory'
  | 'admin.date'
  | 'admin.completedAt'
  | 'admin.currentBalance'
  | 'admin.currentRate'
  | 'admin.newRate'
  | 'admin.rateDescription'
  | 'admin.updateRate'
  | 'admin.updating'
  | 'admin.placeholderEmail'
  | 'admin.placeholderPassword'
  | 'admin.placeholderProductName'
  | 'admin.placeholderAmount'
  | 'admin.resetRequests'
  | 'admin.resetRequestTitle'
  | 'admin.resetRequestSubtitle'
  | 'admin.category'
  | 'admin.product'
  | 'admin.key'
  | 'admin.requestedBy'
  | 'admin.requestedAt'
  | 'admin.status'
  | 'admin.processedAt'
  | 'admin.processedBy'
  | 'admin.approve'
  | 'admin.reject'
  | 'admin.noResetRequests'
  | 'admin.pending'
  | 'admin.approved'
  | 'admin.rejected';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  vi: {
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.cancel': 'Hủy',
    'common.save': 'Lưu',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.search': 'Tìm kiếm',
    'common.close': 'Đóng',
    'common.filter': 'Lọc',
    'common.noData': 'Không có dữ liệu',
    'common.select': 'Chọn',
    
    // Auth
    'auth.login': 'Đăng nhập',
    'auth.logout': 'Đăng xuất',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.loginButton': 'ĐĂNG NHẬP',
    'auth.welcome': 'Chào mừng',
    'auth.username': 'Tên đăng nhập',
    'auth.authenticate': 'XÁC THỰC',
    'auth.enterUsername': 'Nhập tên đăng nhập',
    'auth.enterPassword': 'Nhập mật khẩu',
    'auth.enterBoth': 'Vui lòng nhập cả email và mật khẩu',
    'auth.loginFailed': 'Đăng nhập thất bại',
    'auth.loginSuccess': 'Đăng nhập thành công!',
    
    // Dashboard
    'dashboard.title': 'Reseller Dashboard',
    'dashboard.balance': 'Số dư',
    'dashboard.welcome': 'Chào mừng',
    
    // Navigation
    'nav.generate': 'TẠO KEY',
    'nav.stats': 'THỐNG KÊ',
    'nav.history': 'LỊCH SỬ',
    'nav.transactions': 'GIAO DỊCH',
    'nav.topup': 'NẠP TIỀN',
    
    // Generate Page
    'generate.title': 'Tạo key',
    'generate.subtitle': 'Mua key cho sản phẩm của bạn',
    'generate.selectProduct': 'Chọn Sản phẩm',
    'generate.searchProducts': 'Tìm kiếm sản phẩm...',
    'generate.noProducts': 'Không có sản phẩm',
    'generate.noProductsAvailable': 'Không có sản phẩm nào',
    'generate.outOfStock': 'Hết hàng',
    'generate.purchaseDetails': 'Chi tiết Mua hàng',
    'generate.selectProductToPurchase': 'Chọn sản phẩm để mua',
    'generate.quantity': 'Số lượng',
    'generate.maxAvailable': 'Tối đa',
    'generate.pricePerKey': 'Giá mỗi key:',
    'generate.total': 'Tổng cộng:',
    'generate.yourBalance': 'Số dư của bạn:',
    'generate.insufficientBalance': 'Số dư không đủ',
    'generate.generateKeys': 'TẠO KEYS',
    'generate.processing': 'Đang xử lý...',
    'generate.stock': 'Tồn kho',
    'generate.keysGenerated': 'Tạo Key Thành Công!',
    'generate.key': 'key',
    'generate.purchased': 'đã mua',
    'generate.copyAllKeys': 'Sao Chép Tất Cả Keys',
    
    // Stats Page
    'stats.title': 'Thống kê',
    'stats.subtitle': 'Xem thống kê mua hàng của bạn',
    'stats.totalKeys': 'Tổng số Keys',
    'stats.totalSpent': 'Tổng chi tiêu',
    'stats.avgPrice': 'Giá trung bình',
    'stats.productStatistics': 'Thống kê Sản phẩm',
    'stats.purchased': 'Đã mua',
    'stats.revenue': 'Doanh thu',
    'stats.noStatistics': 'Chưa có thống kê',
    
    // History Page
    'history.title': 'Lịch sử mua Keys',
    'history.subtitle': 'Xem tất cả keys đã mua',
    'history.downloadCSV': 'Tải CSV',
    'history.searchPlaceholder': 'Tìm kiếm theo tên sản phẩm, key, hoặc giá...',
    'history.noHistory': 'Chưa có lịch sử mua hàng',
    'history.noResults': 'Không tìm thấy đơn hàng',
    'history.showing': 'Hiển thị',
    'history.of': 'của',
    'history.orders': 'đơn hàng',
    'history.copyKey': 'Sao chép',
    'history.copied': 'Đã sao chép!',
    'history.requestReset': 'Yêu cầu reset',
    'history.resetRequested': 'Yêu cầu reset đã được gửi',
    'history.resetPending': 'Đang chờ',
    'history.resetApproved': 'Đã reset',
    'history.resetRejected': 'Không thể reset',
    
    // Topup Page
    'topup.title': 'Nạp tiền',
    'topup.subtitle': 'Thêm tiền vào ví',
    'topup.currentBalance': 'Số dư hiện tại',
    'topup.addFunds': 'Thêm tiền',
    'topup.amount': 'Số tiền nạp',
    'topup.quickAmount': 'Số tiền nhanh',
    'topup.newBalance': 'Số dư mới:',
    'topup.topupWallet': 'NẠP TIỀN',
    'topup.processing': 'Đang xử lý...',
    'topup.paymentCreated': 'Đã tạo hóa đơn thanh toán',
    'topup.bankInfo': 'Thông tin chuyển khoản',
    'topup.bankName': 'Ngân hàng',
    'topup.accountNumber': 'Số tài khoản',
    'topup.accountHolder': 'Chủ tài khoản',
    'topup.transferContent': 'Nội dung chuyển khoản',
    'topup.copyContent': 'Sao chép nội dung',
    'topup.copied': 'Đã sao chép!',
    'topup.pendingPayment': 'Hóa đơn đang chờ thanh toán',
    'topup.expiresAt': 'Hết hạn lúc',
    'topup.status': 'Trạng thái',
    'topup.statusPending': 'Đang chờ',
    'topup.statusCompleted': 'Đã hoàn thành',
    'topup.statusExpired': 'Đã hết hạn',
    'topup.transferNote': 'Vui lòng chuyển khoản với nội dung trên để hệ thống tự động cập nhật số dư',
    'topup.scanQR': 'Quét mã QR để thanh toán',
    'topup.qrNote': 'Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản nhanh chóng',
    'topup.paymentCompleted': 'Thanh toán thành công!',
    'topup.exchangeRate': 'Tỷ giá',
    'topup.amountUSD': 'Số tiền nạp (USD)',
    'topup.amountVND': 'Số tiền cần thanh toán',
    'topup.enterAmountUSD': 'Nhập số tiền USD...',
    'topup.amountToPay': 'Số tiền cần thanh toán',
    
    // Transactions Page
    'transactions.title': 'Lịch sử Nạp tiền',
    'transactions.subtitle': 'Xem tất cả giao dịch nạp tiền',
    'transactions.totalTopup': 'Tổng nạp tiền',
    'transactions.thisMonth': 'Tháng này',
    'transactions.history': 'Lịch sử Giao dịch',
    'transactions.noHistory': 'Chưa có lịch sử nạp tiền',
    'transactions.total': 'Tổng cộng',
    'transactions.transaction': 'giao dịch',
    'transactions.transactions': 'giao dịch',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.managePlatform': 'Quản lý nền tảng reseller',
    'admin.sellers': 'Sellers',
    'admin.categories': 'Categories',
    'admin.products': 'Products',
    'admin.inventory': 'Inventory',
    'admin.bankAccounts': 'Ngân hàng',
    'admin.exchangeRate': 'Tỷ giá',
    'admin.createSeller': 'Tạo Seller mới',
    'admin.createCategory': 'Tạo Category',
    'admin.createProduct': 'Tạo Product',
    'admin.addInventory': 'Thêm Inventory Keys',
    'admin.createBankAccount': 'Tạo Tài khoản Ngân hàng',
    'admin.bankAccountsList': 'Danh sách Tài khoản Ngân hàng',
    'admin.bankName': 'Tên ngân hàng',
    'admin.accountNumber': 'Số tài khoản',
    'admin.accountHolder': 'Chủ tài khoản',
    'admin.apiUrl': 'API URL',
    'admin.isActive': 'Trạng thái',
    'admin.active': 'Hoạt động',
    'admin.inactive': 'Không hoạt động',
    'admin.noBankAccounts': 'Chưa có tài khoản ngân hàng',
    'admin.sellersList': 'Danh sách Sellers',
    'admin.categoriesList': 'Danh sách Categories',
    'admin.productsList': 'Danh sách Products',
    'admin.email': 'Địa chỉ Email',
    'admin.password': 'Mật khẩu',
    'admin.categoryName': 'Tên Category',
    'admin.imageUrl': 'URL Hình ảnh',
    'admin.optional': '(tùy chọn)',
    'admin.preview': 'Xem trước:',
    'admin.productName': 'Tên Sản phẩm',
    'admin.price': 'Giá',
    'admin.selectCategory': 'Chọn category',
    'admin.selectProduct': 'Chọn sản phẩm',
    'admin.keys': 'Inventory Keys',
    'admin.onePerLine': '(mỗi key một dòng)',
    'admin.keysEntered': 'key đã nhập',
    'admin.adding': 'Đang thêm...',
    'admin.noSellers': 'Chưa có sellers',
    'admin.noCategories': 'Chưa có categories',
    'admin.noProducts': 'Chưa có products',
    'admin.noSearchResults': 'Không tìm thấy',
    'admin.totalSellers': 'Tổng Sellers',
    'admin.totalCategories': 'Categories',
    'admin.totalProducts': 'Products',
    'admin.totalSold': 'Tổng đã bán',
    'admin.stock': 'Tồn kho',
    'admin.sold': 'Đã bán',
    'admin.selectProductAndKeys': 'Vui lòng chọn sản phẩm và nhập keys',
    'admin.confirmDeleteCategory': 'Bạn có chắc chắn muốn xóa category này? Nếu category đang được sử dụng bởi sản phẩm, bạn sẽ không thể xóa.',
    'admin.confirmDeleteProduct': 'Bạn có chắc chắn muốn xóa sản phẩm này? Nếu sản phẩm đã có đơn hàng, bạn sẽ không thể xóa.',
    'admin.confirmDeleteBankAccount': 'Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?',
    'admin.updating': 'Đang cập nhật...',
    'admin.updateRate': 'Cập nhật tỷ giá',
    'admin.currentRate': 'Tỷ giá hiện tại',
    'admin.balance': 'Số dư',
    'admin.totalTopup': 'Tổng nạp',
    'admin.topup': 'Nạp tiền',
    'admin.history': 'Lịch sử',
    'admin.topupSeller': 'Nạp tiền cho Seller',
    'admin.seller': 'Seller',
    'admin.amountUSD': 'Số tiền (USD)',
    'admin.note': 'Ghi chú',
    'admin.notePlaceholder': 'Nhập ghi chú (tùy chọn)',
    'admin.newBalance': 'Số dư mới',
    'admin.topupHistory': 'Lịch sử nạp tiền',
    'admin.noTopupHistory': 'Chưa có lịch sử nạp tiền',
    'admin.date': 'Ngày',
    'admin.completedAt': 'Hoàn thành lúc',
    'admin.currentBalance': 'Số dư hiện tại',
    'admin.newRate': 'Tỷ giá mới (VNĐ)',
    'admin.rateDescription': 'Nhập số tiền VNĐ tương đương với 1 USD',
    'admin.placeholderEmail': 'seller@example.com',
    'admin.placeholderPassword': 'Nhập mật khẩu an toàn',
    'admin.placeholderProductName': 'Nhập tên sản phẩm',
    'admin.placeholderAmount': 'Nhập số tiền',
    'admin.resetRequests': 'Yêu cầu Reset',
    'admin.resetRequestTitle': 'Quản lý yêu cầu reset key',
    'admin.resetRequestSubtitle': 'Xem và xử lý các yêu cầu reset từ seller',
    'admin.category': 'Danh mục',
    'admin.product': 'Sản phẩm',
    'admin.key': 'Key',
    'admin.requestedBy': 'Người yêu cầu',
    'admin.requestedAt': 'Ngày yêu cầu',
    'admin.status': 'Trạng thái',
    'admin.processedAt': 'Ngày xử lý',
    'admin.processedBy': 'Người xử lý',
    'admin.approve': 'Đã reset',
    'admin.reject': 'Hủy',
    'admin.noResetRequests': 'Chưa có yêu cầu reset nào',
    'admin.pending': 'Đang chờ',
    'admin.approved': 'Đã duyệt',
    'admin.rejected': 'Đã từ chối',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.close': 'Close',
    'common.noData': 'No data',
    'common.select': 'Select',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginButton': 'LOGIN',
    'auth.welcome': 'Welcome',
    'auth.username': 'Username',
    'auth.authenticate': 'AUTHENTICATE',
    'auth.enterUsername': 'Enter your username',
    'auth.enterPassword': 'Enter your password',
    'auth.enterBoth': 'Please enter both email and password',
    'auth.loginFailed': 'Login failed',
    'auth.loginSuccess': 'Login successful!',
    
    // Dashboard
    'dashboard.title': 'Reseller Dashboard',
    'dashboard.balance': 'Balance',
    'dashboard.welcome': 'Welcome',
    
    // Navigation
    'nav.generate': 'GENERATE',
    'nav.stats': 'STATS',
    'nav.history': 'HISTORY',
    'nav.transactions': 'TRANSACTIONS',
    'nav.topup': 'TOPUP',
    
    // Generate Page
    'generate.title': 'Key Generator',
    'generate.subtitle': 'Purchase keys for your products',
    'generate.selectProduct': 'Select Product',
    'generate.searchProducts': 'Search products...',
    'generate.noProducts': 'No products',
    'generate.noProductsAvailable': 'No products available',
    'generate.outOfStock': 'Out of Stock',
    'generate.purchaseDetails': 'Purchase Details',
    'generate.selectProductToPurchase': 'Select a product to purchase',
    'generate.quantity': 'Quantity',
    'generate.maxAvailable': 'Max',
    'generate.pricePerKey': 'Price per key:',
    'generate.total': 'Total:',
    'generate.yourBalance': 'Your Balance:',
    'generate.insufficientBalance': 'Insufficient balance',
      'generate.generateKeys': 'GENERATE KEYS',
      'generate.processing': 'Processing...',
      'generate.stock': 'Stock',
      'generate.keysGenerated': 'Keys Generated Successfully!',
      'generate.key': 'key',
      'generate.purchased': 'purchased',
      'generate.copyAllKeys': 'Copy All Keys',
    
    // Stats Page
    'stats.title': 'Statistics',
    'stats.subtitle': 'View your purchase statistics',
    'stats.totalKeys': 'Total Keys',
    'stats.totalSpent': 'Total Spent',
    'stats.avgPrice': 'Avg Price',
    'stats.productStatistics': 'Product Statistics',
    'stats.purchased': 'Purchased',
    'stats.revenue': 'Revenue',
    'stats.noStatistics': 'No purchase statistics yet',
    
    // History Page
    'history.title': 'Key History',
    'history.subtitle': 'View all your purchased keys',
    'history.downloadCSV': 'Download CSV',
    'history.searchPlaceholder': 'Search by product name, key, or price...',
    'history.noHistory': 'No purchase history yet',
    'history.noResults': 'No orders found matching your search',
      'history.showing': 'Showing',
      'history.of': 'of',
      'history.orders': 'orders',
      'history.copyKey': 'Copy',
      'history.copied': 'Copied!',
      'history.requestReset': 'Request Reset',
      'history.resetRequested': 'Reset request sent',
      'history.resetPending': 'Pending',
      'history.resetApproved': 'Reset',
      'history.resetRejected': 'Cannot reset',
    
    // Topup Page
    'topup.title': 'Topup Wallet',
    'topup.subtitle': 'Add funds to your wallet',
    'topup.currentBalance': 'Current Balance',
    'topup.addFunds': 'Add Funds',
    'topup.amount': 'Topup Amount',
    'topup.quickAmount': 'Quick Amount',
    'topup.newBalance': 'New Balance:',
    'topup.topupWallet': 'TOPUP WALLET',
    'topup.processing': 'Processing...',
    'topup.paymentCreated': 'Payment invoice created',
    'topup.bankInfo': 'Bank Transfer Information',
    'topup.bankName': 'Bank Name',
    'topup.accountNumber': 'Account Number',
    'topup.accountHolder': 'Account Holder',
    'topup.transferContent': 'Transfer Content',
    'topup.copyContent': 'Copy Content',
    'topup.copied': 'Copied!',
    'topup.pendingPayment': 'Pending Payment Invoice',
    'topup.expiresAt': 'Expires At',
    'topup.status': 'Status',
    'topup.statusPending': 'Pending',
    'topup.statusCompleted': 'Completed',
    'topup.statusExpired': 'Expired',
      'topup.transferNote': 'Please transfer with the above content for automatic balance update',
      'topup.scanQR': 'Scan QR Code to Pay',
      'topup.qrNote': 'Scan QR code with your banking app for quick transfer',
      'topup.paymentCompleted': 'Payment completed successfully!',
      'topup.exchangeRate': 'Exchange Rate',
    'topup.amountUSD': 'Topup Amount (USD)',
    'topup.amountVND': 'Amount to Pay',
    'topup.enterAmountUSD': 'Enter USD amount...',
    'topup.amountToPay': 'Amount to Pay',
    
    // Transactions Page
    'transactions.title': 'Topup History',
    'transactions.subtitle': 'View all your wallet topup transactions',
    'transactions.totalTopup': 'Total Topup',
    'transactions.thisMonth': 'This Month',
    'transactions.history': 'Transaction History',
    'transactions.noHistory': 'No topup history yet',
    'transactions.total': 'Total',
    'transactions.transaction': 'transaction',
    'transactions.transactions': 'transactions',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.managePlatform': 'Manage your reseller platform',
    'admin.sellers': 'Sellers',
    'admin.categories': 'Categories',
    'admin.products': 'Products',
    'admin.inventory': 'Inventory',
    'admin.bankAccounts': 'Bank Accounts',
    'admin.exchangeRate': 'Exchange Rate',
    'admin.createSeller': 'Create New Seller',
    'admin.createCategory': 'Create Category',
    'admin.createProduct': 'Create Product',
    'admin.addInventory': 'Add Inventory Keys',
    'admin.createBankAccount': 'Create Bank Account',
    'admin.bankAccountsList': 'Bank Accounts List',
    'admin.bankName': 'Bank Name',
    'admin.accountNumber': 'Account Number',
    'admin.accountHolder': 'Account Holder',
    'admin.apiUrl': 'API URL',
    'admin.isActive': 'Status',
    'admin.active': 'Active',
    'admin.inactive': 'Inactive',
    'admin.noBankAccounts': 'No bank accounts yet',
    'admin.sellersList': 'Sellers List',
    'admin.categoriesList': 'Categories List',
    'admin.productsList': 'Products List',
    'admin.email': 'Email Address',
    'admin.password': 'Password',
    'admin.categoryName': 'Category Name',
    'admin.imageUrl': 'Image URL',
    'admin.optional': '(optional)',
    'admin.preview': 'Preview:',
    'admin.productName': 'Product Name',
    'admin.price': 'Price',
    'admin.selectCategory': 'Select a category',
    'admin.selectProduct': 'Choose a product...',
    'admin.keys': 'Inventory Keys',
    'admin.onePerLine': '(one key per line)',
    'admin.keysEntered': 'key(s) entered',
    'admin.adding': 'Adding...',
    'admin.noSellers': 'No sellers yet',
    'admin.noCategories': 'No categories yet',
    'admin.noProducts': 'No products yet',
    'admin.noSearchResults': 'No results found',
    'admin.totalSellers': 'Total Sellers',
    'admin.totalCategories': 'Categories',
    'admin.totalProducts': 'Products',
    'admin.totalSold': 'Total Sold',
    'admin.stock': 'Stock',
    'admin.sold': 'Sold',
    'admin.selectProductAndKeys': 'Please select a product and enter keys',
    'admin.confirmDeleteCategory': 'Are you sure you want to delete this category? If the category is being used by products, you will not be able to delete it.',
    'admin.confirmDeleteProduct': 'Are you sure you want to delete this product? If the product has orders, you will not be able to delete it.',
    'admin.confirmDeleteBankAccount': 'Are you sure you want to delete this bank account?',
    'admin.updating': 'Updating...',
    'admin.updateRate': 'Update Exchange Rate',
    'admin.currentRate': 'Current Rate',
    'admin.newRate': 'New Rate (VND)',
    'admin.rateDescription': 'Enter the VND amount equivalent to 1 USD',
    'admin.balance': 'Balance',
    'admin.totalTopup': 'Total Topup',
    'admin.topup': 'Topup',
    'admin.history': 'History',
    'admin.topupSeller': 'Topup Seller',
    'admin.seller': 'Seller',
    'admin.amountUSD': 'Amount (USD)',
    'admin.note': 'Note',
    'admin.notePlaceholder': 'Enter note (optional)',
    'admin.newBalance': 'New Balance',
    'admin.topupHistory': 'Topup History',
    'admin.noTopupHistory': 'No topup history yet',
    'admin.date': 'Date',
    'admin.completedAt': 'Completed At',
    'admin.currentBalance': 'Current Balance',
    'admin.placeholderEmail': 'seller@example.com',
    'admin.placeholderPassword': 'Enter secure password',
    'admin.placeholderProductName': 'Enter product name',
    'admin.placeholderAmount': 'Enter amount',
    'admin.resetRequests': 'Reset Requests',
    'admin.resetRequestTitle': 'Manage reset key requests',
    'admin.resetRequestSubtitle': 'View and process reset requests from sellers',
    'admin.category': 'Category',
    'admin.product': 'Product',
    'admin.key': 'Key',
    'admin.requestedBy': 'Requested By',
    'admin.requestedAt': 'Requested At',
    'admin.status': 'Status',
    'admin.processedAt': 'Processed At',
    'admin.processedBy': 'Processed By',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.noResetRequests': 'No reset requests yet',
    'admin.pending': 'Pending',
    'admin.approved': 'Approved',
    'admin.rejected': 'Rejected',
  },
};

export type Language = 'vi' | 'en';

