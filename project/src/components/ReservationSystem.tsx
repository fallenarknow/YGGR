import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, CheckCircle, AlertCircle, User, CreditCard } from 'lucide-react';

interface ReservationSystemProps {
  item: any;
  onConfirm: (reservation: any) => void;
  onCancel: () => void;
}

export const ReservationSystem: React.FC<ReservationSystemProps> = ({
  item,
  onConfirm,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [reservationData, setReservationData] = useState({
    pickupDate: '',
    pickupTime: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    specialInstructions: '',
    paymentMethod: 'cash'
  });

  const timeSlots = [
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM'
  ];

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleSubmit = () => {
    const reservation = {
      id: `RES-${Date.now()}`,
      ...reservationData,
      item,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours
    };
    onConfirm(reservation);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-900">
              Reserve Your Plant
            </h2>
            <button
              onClick={onCancel}
              className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 mt-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNum ? 'bg-primary-500' : 'bg-secondary-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-secondary-600 mt-2">
            <span>Plant Details</span>
            <span>Pickup Time</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Plant Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Confirm Plant Details
              </h3>
              
              <div className="bg-secondary-50 rounded-xl p-6">
                <div className="flex space-x-4">
                  <img
                    src={item.plant.images[0]}
                    alt={item.plant.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-secondary-900 text-lg mb-2">
                      {item.plant.name}
                    </h4>
                    <p className="text-secondary-600 mb-2">{item.size}</p>
                    <div className="text-2xl font-bold text-primary-600">
                      ₹{item.price}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-6">
                <h4 className="font-semibold text-primary-900 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Pickup Location
                </h4>
                <div className="space-y-2">
                  <div className="font-medium text-primary-800">{item.shop.name}</div>
                  <div className="text-primary-700">{item.shop.address}</div>
                  <div className="flex items-center space-x-4 text-sm text-primary-600">
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {item.shop.phone}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.shop.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium mb-1">Reservation Policy</div>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Plant will be held for 48 hours</li>
                      <li>• No advance payment required</li>
                      <li>• Bring valid ID for pickup</li>
                      <li>• Call shop if you need to reschedule</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Continue to Pickup Time
              </button>
            </div>
          )}

          {/* Step 2: Pickup Time */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Choose Pickup Time
              </h3>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Pickup Date
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date}
                      onClick={() => setReservationData(prev => ({ ...prev, pickupDate: date }))}
                      className={`p-3 rounded-xl border-2 text-sm transition-colors ${
                        reservationData.pickupDate === date
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium">
                        {date === new Date().toISOString().split('T')[0] ? 'Today' : 
                         date === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'Tomorrow' :
                         new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
                        }
                      </div>
                      <div className="text-xs text-secondary-600">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {reservationData.pickupDate && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Pickup Time
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setReservationData(prev => ({ ...prev, pickupTime: slot }))}
                        className={`p-3 rounded-xl border-2 text-sm transition-colors ${
                          reservationData.pickupTime === slot
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-secondary-200 hover:border-primary-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-secondary-900">Contact Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={reservationData.customerName}
                      onChange={(e) => setReservationData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={reservationData.customerPhone}
                      onChange={(e) => setReservationData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={reservationData.customerEmail}
                    onChange={(e) => setReservationData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={reservationData.specialInstructions}
                    onChange={(e) => setReservationData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any special requests or instructions..."
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:border-primary-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!reservationData.pickupDate || !reservationData.pickupTime || !reservationData.customerName || !reservationData.customerPhone}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Reservation
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Confirm Reservation
              </h3>

              {/* Reservation Summary */}
              <div className="bg-secondary-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-medium text-secondary-900">
                      {formatDate(reservationData.pickupDate)}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {reservationData.pickupTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-medium text-secondary-900">
                      {reservationData.customerName}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {reservationData.customerPhone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-medium text-secondary-900">
                      {item.shop.name}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {item.shop.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plant Summary */}
              <div className="border border-secondary-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.plant.images[0]}
                      alt={item.plant.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <div className="font-medium text-secondary-900">
                        {item.plant.name}
                      </div>
                      <div className="text-sm text-secondary-600">
                        {item.size}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-secondary-900">
                    ₹{item.price}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Payment Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg cursor-pointer hover:border-primary-300">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={reservationData.paymentMethod === 'cash'}
                      onChange={(e) => setReservationData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="text-primary-600"
                    />
                    <span className="font-medium">Pay at Pickup (Cash/UPI)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg cursor-pointer hover:border-primary-300 opacity-50">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      disabled
                      className="text-primary-600"
                    />
                    <span className="font-medium">Pay Online (Coming Soon)</span>
                  </label>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-2">Reservation Confirmed!</div>
                    <ul className="space-y-1 text-green-700">
                      <li>• You'll receive SMS confirmation shortly</li>
                      <li>• Plant will be held for 48 hours</li>
                      <li>• Bring valid ID for pickup</li>
                      <li>• Call shop if you need to reschedule</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:border-primary-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirm Reservation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};