import React from 'react'

interface StatCardProps {
  title: string
  count: number | string
  badge?: string
  badgeColor?: string
  badgeTextColor?: string
  arrowUp?: boolean
  subtext?: string
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  count,
  badge,
  badgeColor = 'bg-[#94E9B8]',
  badgeTextColor = 'text-[#333]',
  arrowUp = true,
  subtext,
  className = '',
  onClick
}: StatCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl outline outline-1 outline-[rgba(102,102,102,0.21)] outline-offset-[-0.5px] overflow-hidden w-[263px] h-[120px] ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {/* Title */}
      <div className="absolute left-6 top-6 w-[210px] rounded-lg flex flex-col justify-center items-start">
        <div className="font-semibold text-[14px] leading-5 text-black font-inter">{title}</div>
      </div>

      {/* Count */}
      <div className="absolute left-6 top-[60px] text-[36px] font-semibold text-black font-['Open_Sans'] leading-5">
        {count}
      </div>

      {/* Badge + Arrow */}
      {badge && (
        <div className="absolute left-[109px] top-[26px] h-4 flex items-center">
          <span className={`inline-flex items-center px-2 h-4 rounded-lg ${badgeColor}`}>
            <span className={`text-[8px] font-semibold leading-4 ${badgeTextColor}`}>{badge}</span>
          </span>
          <svg
            className="ml-1"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d={arrowUp
                ? "M8.66675 3.33334H12.6667V7.33334 M12.6667 3.33334L6.66675 9.33334"
                : "M8.66675 12.6667H12.6667V8.66667 M12.6667 12.6667L6.66675 6.66667"}
              stroke="black"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <div className="absolute left-6 top-[87px] w-20 flex items-center">
          <span className="text-[8px] font-normal leading-4 text-[#333] font-['Open_Sans']">{subtext}</span>
        </div>
      )}
    </div>
  )
}

// interfaces at end