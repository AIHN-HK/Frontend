export function RecoverySteps({active}: {active:1|3}) {
  return <ol className="recovery-steps" aria-label="Các bước khôi phục">
    {['Email','OTP','Mật khẩu'].map((label,index) => <li key={label} aria-current={index+1 === active ? 'step' : undefined} data-confirmed={index+1 < active}>{index+1}. {label}</li>)}
  </ol>;
}
