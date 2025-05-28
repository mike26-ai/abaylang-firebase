
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Gift, Check, X } from "lucide-react"

interface ReferralCodeInputProps {
  referralCode: string
  setReferralCode: (code: string) => void
}

export function ReferralCodeInput({ referralCode, setReferralCode }: ReferralCodeInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [discount, setDiscount] = useState<number | null>(null)

  const validateCode = async () => {
    if (!referralCode.trim()) return

    setIsValidating(true)

    // Simulate API validation
    setTimeout(() => {
      const validCodes = ["FRIEND10", "WELCOME15", "STUDENT20"]
      const isCodeValid = validCodes.includes(referralCode.toUpperCase())

      setIsValid(isCodeValid)
      if (isCodeValid) {
        const discountAmount = Number.parseInt(referralCode.slice(-2)) || 10
        setDiscount(discountAmount)
      } else {
        setDiscount(null)
      }
      setIsValidating(false)
    }, 1000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Referral Code</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => {
            setReferralCode(e.target.value)
            setIsValid(null)
            setDiscount(null)
          }}
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={validateCode} disabled={!referralCode.trim() || isValidating}>
          {isValidating ? "..." : "Apply"}
        </Button>
      </div>

      {isValid === true && discount && (
        <div className="flex items-center gap-2 p-2 bg-accent border border-primary/30 rounded-md">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Code applied! You'll save {discount}% on this booking.</span>
        </div>
      )}

      {isValid === false && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
          <X className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">Invalid referral code. Please check and try again.</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Popular codes: FRIEND10, WELCOME15, STUDENT20</p>
      </div>
    </div>
  )
}
