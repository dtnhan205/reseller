import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { Copy, Check, Download, Play, ShieldCheck, Wifi, Crosshair, Radar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import ParticleNetwork from '@/components/ParticleNetwork';

interface ProxyVipConfig {
  ip?: string;
  port?: string;
  aimLink?: string;
  installText?: string;
  installVideoUrl?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  proxyvip: number;
  proxyvipConfig: ProxyVipConfig;
}

export default function PublicProxyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [serverKey, setServerKey] = useState<string>('');
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const loadKey = async () => {
      setIsCheckingKey(true);
      try {
        const data = await adminApi.getPublicProxyVipAccessKey();
        setServerKey(data.value || '');
        const savedKey = localStorage.getItem('public_proxy_key');
        const savedAt = localStorage.getItem('public_proxy_key_at');
        if (savedKey && savedAt && data.value) {
          const savedTime = Number(savedAt);
          const isValidTime = Number.isFinite(savedTime) && Date.now() - savedTime < 60_000;
          const isValidKey = savedKey === data.value;
          if (isValidTime && isValidKey) {
            setIsAuthorized(true);
          } else {
            localStorage.removeItem('public_proxy_key');
            localStorage.removeItem('public_proxy_key_at');
          }
        }
      } catch (err) {
        console.error('Failed to load proxy access key:', err);
      } finally {
        setIsCheckingKey(false);
      }
    };

    loadKey();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadProducts();
    }
  }, [isAuthorized]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPublicProxyProducts();
      const proxyProducts = (data as Product[]).filter(p => p.proxyvip == 1);
      setProducts(proxyProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!serverKey) {
      setKeyError('Không thể kiểm tra key. Vui lòng thử lại sau.');
      return;
    }
    if (trimmed === serverKey) {
      localStorage.setItem('public_proxy_key', serverKey);
      localStorage.setItem('public_proxy_key_at', Date.now().toString());
      setIsAuthorized(true);
      setKeyError('');
      return;
    }
    setKeyError('Key không đúng. Vui lòng thử lại.');
  };

  useEffect(() => {
    if (!isAuthorized) return;
    const timeoutId = window.setTimeout(() => {
      setIsAuthorized(false);
      localStorage.removeItem('public_proxy_key');
      localStorage.removeItem('public_proxy_key_at');
      setKeyInput('');
      setKeyError('Phiên đã hết hạn. Vui lòng nhập lại key.');
    }, 60_000);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthorized]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDisplayProductName = (name: string) => {
    return name.replace(/^Proxy\s*VIP\s*[-–]\s*/i, '').trim();
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] text-white selection:bg-indigo-500/25 flex items-center justify-center p-4">
        <ParticleNetwork
          particleColor="rgba(168, 85, 247, 0.5)"
          lineColor="rgba(168, 85, 247, 0.15)"
          particleCount={50}
          linkDistance={120}
          opacity={0.6}
          lineOpacityMultiplier={1.5}
        />
        <div className="w-full max-w-md bg-black/40 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Nhập Key Truy Cập</h2>
            <p className="text-gray-400 mt-2 text-sm">Vui lòng nhập key để truy cập trang Proxy VIP.</p>
          </div>
          {isCheckingKey ? (
            <div className="text-center text-sm text-gray-400">Đang kiểm tra key...</div>
          ) : (
            <form onSubmit={handleSubmitKey} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Nhập key"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800 focus:border-purple-500 outline-none text-white"
                  autoFocus
                />
                {keyError && (
                  <p className="mt-2 text-sm text-red-400">{keyError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 font-semibold"
                disabled={!serverKey}
              >
                Xác nhận
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] text-white selection:bg-indigo-500/25 flex items-center justify-center">
        <ParticleNetwork
          particleColor="rgba(168, 85, 247, 0.5)"
          lineColor="rgba(168, 85, 247, 0.15)"
          particleCount={50}
          linkDistance={120}
          opacity={0.6}
          lineOpacityMultiplier={1.5}
        />
        <div className="text-center bg-black/40 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] text-white selection:bg-indigo-500/25 flex items-center justify-center p-4">
        <ParticleNetwork
          particleColor="rgba(168, 85, 247, 0.6)"
          lineColor="rgba(168, 85, 247, 0.15)"
          particleCount={50}
          linkDistance={120}
          opacity={0.6}
          lineOpacityMultiplier={1.5}
        />
        <div className="text-center max-w-md bg-black/40 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/10">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radar className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Chưa có sản phẩm</h2>
          <p className="text-gray-500">Hiện tại chưa có Proxy VIP nào được mở bán.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] text-white selection:bg-indigo-500/25 py-12 px-4">
      <ParticleNetwork
        particleColor="rgba(168, 85, 247, 0.6)"
        lineColor="rgba(168, 85, 247, 0.15)"
        particleCount={50}
        linkDistance={120}
        opacity={0.6}
        lineOpacityMultiplier={1.5}
      />

      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <div className="inline-block px-6 py-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Proxy VIP
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Danh sách các gói Proxy VIP dành riêng cho bạn. Click vào sản phẩm để xem chi tiết và hướng dẫn cài đặt.
          </p>
        </div>
        <div className="mt-6 mx-auto max-w-3xl rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 text-left">
          <p className="text-yellow-200 font-semibold">Lưu ý:</p>
          <p className="text-yellow-100/80 text-sm mt-1">
            Proxy VIP <span className="font-semibold">không phải free</span>. Sau khi mua thành công, hệ thống sẽ tạo key và hiển thị ngay cho bạn.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Product List */}
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className={`bg-black/40 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${
                selectedProduct === product._id
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Product Header */}
              <button
                onClick={() => setSelectedProduct(selectedProduct === product._id ? null : product._id)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-white/10">
                    <Crosshair className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                      {getDisplayProductName(product.name)}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300">
                      Proxy VIP
                    </span>
                  </div>
                </div>
                {selectedProduct === product._id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Expanded Content */}
              {selectedProduct === product._id && (
                <div className="border-t border-white/10 p-5 pt-4">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {product.proxyvipConfig?.ip && (
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Wifi className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">IP Proxy</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="text-cyan-300 font-mono font-bold">{product.proxyvipConfig.ip}</code>
                            <button
                              onClick={() => copyToClipboard(product.proxyvipConfig?.ip || '', 'ip')}
                              className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                            >
                              {copiedField === 'ip' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {product.proxyvipConfig?.port && (
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">Port</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <code className="text-emerald-300 font-mono font-bold">{product.proxyvipConfig.port}</code>
                            <button
                              onClick={() => copyToClipboard(product.proxyvipConfig?.port || '', 'port')}
                              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                            >
                              {copiedField === 'port' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {product.proxyvipConfig?.aimLink && (
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Download className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">Tải File Aim</span>
                          </div>
                          <a
                            href={product.proxyvipConfig.aimLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Tải về máy
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      {product.proxyvipConfig?.installVideoUrl && (
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Play className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">Video Hướng Dẫn</span>
                          </div>
                          <video
                            className="w-full rounded-lg border border-white/10 bg-black"
                            src={(() => {
                              const url = product.proxyvipConfig?.installVideoUrl;
                              if (!url) return '';
                              if (url.startsWith('http://') || url.startsWith('https://')) {
                                return url;
                              }
                              return url.startsWith('/') ? url : `/${url}`;
                            })()}
                            controls
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
