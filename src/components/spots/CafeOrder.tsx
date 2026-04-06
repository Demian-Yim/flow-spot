'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SpotLayout from '@/components/spots/SpotLayout'
import { useSound } from '@/hooks/useSound'
import { CAFE_MENU, CafeMenuCategory } from '@/lib/spot-data'
import { CafeOrder as CafeOrderType } from '@/types'
import { ShoppingCart, Plus, Minus, Trash2, Send, MapPin, Search, Loader2, ExternalLink } from 'lucide-react'

interface CafeOrderProps {
  duration?: number
  onComplete?: (order: any) => void
  isPresenter?: boolean
  participantId?: string
  participantName?: string
  onSubmitOrder?: (order: Omit<CafeOrderType, 'id' | 'orderedAt'>) => void
  orders?: CafeOrderType[]
}

interface CartItem {
  name: string
  emoji: string
  price: string
  quantity: number
}

interface NearbyCafe {
  id: string
  name: string
  category: string
  address: string
  distance: string
  phone: string
  url: string
}

const CafeOrder: React.FC<CafeOrderProps> = ({
  duration = 180,
  onComplete,
  isPresenter = false,
  participantId = '',
  participantName = '',
  onSubmitOrder,
  orders = [],
}) => {
  const [activeCategory, setActiveCategory] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [showNearby, setShowNearby] = useState(false)
  const [nearbyCafes, setNearbyCafes] = useState<NearbyCafe[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState<string | null>(null)
  const [locationGranted, setLocationGranted] = useState(false)
  const { playSound, playCelebrateSound } = useSound()

  const searchNearbyCafes = async (query = '카페') => {
    setNearbyLoading(true)
    setNearbyError(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      })
      setLocationGranted(true)
      const res = await fetch(
        `/api/nearby-cafes?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&query=${encodeURIComponent(query)}`
      )
      const data = await res.json()
      if (data.success) {
        setNearbyCafes(data.cafes)
      } else {
        setNearbyError(data.error || '검색 실패')
      }
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError && err.code === 1) {
        setNearbyError('위치 접근 권한을 허용해주세요')
      } else {
        const message = err instanceof Error ? err.message : '위치를 가져올 수 없습니다'
        setNearbyError(message)
      }
    } finally {
      setNearbyLoading(false)
    }
  }

  const addToCart = (item: { name: string; emoji: string; price: string }) => {
    const existing = cart.find((c) => c.name === item.name)
    if (existing) {
      setCart(cart.map((c) => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    playSound('click')
  }

  const removeFromCart = (name: string) => {
    const existing = cart.find((c) => c.name === name)
    if (existing && existing.quantity > 1) {
      setCart(cart.map((c) => c.name === name ? { ...c, quantity: c.quantity - 1 } : c))
    } else {
      setCart(cart.filter((c) => c.name !== name))
    }
    playSound('click')
  }

  const clearItem = (name: string) => {
    setCart(cart.filter((c) => c.name !== name))
  }

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0)

  const handleSubmitOrder = () => {
    if (cart.length === 0) return
    onSubmitOrder?.({
      participantId,
      participantName,
      items: cart.map((c) => ({ name: c.name, emoji: c.emoji, quantity: c.quantity })),
    })
    setOrderSubmitted(true)
    playSound('success')
  }

  const finishSpot = () => {
    setIsComplete(true)
    playCelebrateSound()
    onComplete?.({ cart, orderSubmitted })
  }

  // ─── Presenter Content ───
  const presenterContent = (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">주문 현황</h2>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-center py-8">아직 주문이 없습니다</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            {orders.map((order, i) => (
              <div key={order.id || i} className="bg-white/5 rounded-xl p-4">
                <p className="font-semibold text-white text-sm mb-2">{order.participantName}</p>
                <div className="space-y-1">
                  {order.items.map((item, j) => (
                    <p key={j} className="text-slate-300 text-sm">
                      {item.emoji} {item.name} x{item.quantity}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <p className="text-lg text-slate-300">총 {orders.length}건 주문</p>
        </div>
      </div>

      {/* Menu overview */}
      <div className="grid grid-cols-4 gap-3">
        {CAFE_MENU.map((cat) => (
          <div key={cat.cat} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{cat.cat.split(' ')[0]}</p>
            <p className="text-sm text-slate-300">{cat.items.length}개 메뉴</p>
          </div>
        ))}
      </div>
    </div>
  )

  // ─── Participant Content ───
  const participantContent = orderSubmitted ? (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card variant="elevated" className="shadow-lg text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">주문 완료!</h3>
        <p className="text-sm text-slate-500 mb-4">주문이 전송되었습니다</p>
        <div className="bg-slate-50 rounded-xl p-3 space-y-1">
          {cart.map((item) => (
            <p key={item.name} className="text-sm text-slate-700">
              {item.emoji} {item.name} x{item.quantity}
            </p>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4" onClick={finishSpot}>
          완료
        </Button>
      </Card>
    </motion.div>
  ) : (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="elevated" className="shadow-lg" noPadding>
        {/* Mode Toggle: Menu / Nearby */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setShowNearby(false)}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
              !showNearby ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500'
            }`}
          >
            기본 메뉴
          </button>
          <button
            onClick={() => { setShowNearby(true); if (nearbyCafes.length === 0) searchNearbyCafes() }}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
              showNearby ? 'text-primary-600 border-b-2 border-primary-500' : 'text-slate-500'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> 주변 카페
          </button>
        </div>

        {/* Nearby Cafes Panel */}
        {showNearby && (
          <div className="p-4">
            {nearbyLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 text-primary-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">주변 카페 검색 중...</p>
              </div>
            ) : nearbyError ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-red-500">{nearbyError}</p>
                <Button size="sm" variant="outline" onClick={() => searchNearbyCafes()}>
                  다시 시도
                </Button>
              </div>
            ) : nearbyCafes.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nearbyCafes.map((cafe) => (
                  <div
                    key={cafe.id}
                    className="flex items-start gap-3 px-3 py-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{cafe.name}</p>
                      <p className="text-xs text-slate-500 truncate">{cafe.address}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-primary-600 font-medium">{cafe.distance}</span>
                        {cafe.phone && <span className="text-xs text-slate-400">{cafe.phone}</span>}
                      </div>
                    </div>
                    {cafe.url && (
                      <a
                        href={cafe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center pt-2">
                  카페를 확인한 후 기본 메뉴에서 주문하세요
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">주변 카페를 검색하세요</p>
                <div className="flex gap-2 justify-center mt-3">
                  <Button size="sm" variant="primary" onClick={() => searchNearbyCafes('카페')}>카페</Button>
                  <Button size="sm" variant="outline" onClick={() => searchNearbyCafes('음식점')}>음식점</Button>
                  <Button size="sm" variant="outline" onClick={() => searchNearbyCafes('베이커리')}>베이커리</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Tabs (original menu) */}
        {!showNearby && <>
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {CAFE_MENU.map((cat, i) => (
            <button
              key={cat.cat}
              onClick={() => setActiveCategory(i)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeCategory === i
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat.cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="grid grid-cols-2 gap-2"
            >
              {CAFE_MENU[activeCategory].items.map((item) => {
                const inCart = cart.find((c) => c.name === item.name)
                return (
                  <motion.button
                    key={item.name}
                    onClick={() => addToCart(item)}
                    className={`text-left rounded-xl p-3 transition-all border ${
                      inCart
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xl">{item.emoji}</span>
                      {inCart && (
                        <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 mt-1">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.price}</p>
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
        </>}

        {/* Cart */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">장바구니 ({totalItems})</span>
            </div>

            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{item.emoji}</span>
                    <span className="text-sm text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromCart(item.name) }}
                      className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(item) }}
                      className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearItem(item.name) }}
                      className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmitOrder}
              icon={<Send className="w-4 h-4" />}
            >
              주문하기 ({totalItems}개)
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )

  return (
    <SpotLayout
      title="카페 주문"
      subtitle="CAFE ORDER"
      duration={duration}
      onTimerComplete={finishSpot}
      isComplete={isComplete}
      completionEmoji="☕"
      completionTitle="주문 완료!"
      completionMessage="음료/간식 주문이 완료되었습니다!"
      completionDetail={`${totalItems}개 항목 주문`}
      theme="primary"
      isPresenter={isPresenter}
      presenterContent={presenterContent}
    >
      {participantContent}
    </SpotLayout>
  )
}

export default CafeOrder
