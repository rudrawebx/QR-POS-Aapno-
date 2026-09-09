'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, X, Heart } from 'lucide-react';

interface Props {
  restaurantId: string;
  orderId?: string;
  onClose: () => void;
}

export default function FeedbackModal({ restaurantId, orderId, onClose }: Props) {
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ambienceRating, setAmbienceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          orderId,
          overallRating,
          foodRating,
          serviceRating,
          ambienceRating,
          comment,
        }),
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform cursor-pointer"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dhanyawaad! Thank You!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your valuable feedback helps us refine our royal dining hospitality. Have a wonderful day ahead!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">How Was Your Dining Experience?</h3>
              <p className="text-xs text-slate-500 mt-0.5">Please rate our food quality and service</p>
            </div>

            {/* Rating categories */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Overall Rating:</span>
                <StarSelector value={overallRating} onChange={setOverallRating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Food & Flavor:</span>
                <StarSelector value={foodRating} onChange={setFoodRating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Service Hospitality:</span>
                <StarSelector value={serviceRating} onChange={setServiceRating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Ambience:</span>
                <StarSelector value={ambienceRating} onChange={setAmbienceRating} />
              </div>
            </div>

            {/* Comment */}
            <textarea
              rows={2}
              placeholder="Tell us what you loved or how we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
