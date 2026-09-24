import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'brand' }) => {
  const colorMap = {
    brand: 'from-brand-500/10 to-brand-600/5 text-brand-600 border-brand-100',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-100',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-100',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-600 border-rose-100',
    cyan: 'from-cyan-500/10 to-cyan-600/5 text-cyan-600 border-cyan-100',
  };

  const iconBgMap = {
    brand: 'bg-brand-100 text-brand-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className={`relative p-5 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md ${colorMap[color] || colorMap.brand}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgMap[color] || iconBgMap.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{trend.label}</span>
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
