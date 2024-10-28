'use client';

import CountUp from 'react-countup';

const AnimatedCounterStudent = ({ amount }: { amount: number }) => {
  return (
    <div className="w-full">
      <CountUp 
        decimals={0}
        decimal=","
        separator=" "
        suffix=" Ft"
        end={amount} 
      />
    </div>
  )
}

export default AnimatedCounterStudent