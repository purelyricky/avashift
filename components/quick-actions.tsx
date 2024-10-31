"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { SunIcon, MoonIcon, AlertTriangle, InfoIcon } from 'lucide-react'

export function QuickActions() {
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('')
  const [availability, setAvailability] = useState<string[]>([])

  const [payStubsModalOpen, setPayStubsModalOpen] = useState(false)
  const [timeOffModalOpen, setTimeOffModalOpen] = useState(false)
  const [timeOffStatus, setTimeOffStatus] = useState('active')

  const handleAddAvailability = () => {
    if (selectedDay && selectedTimeOfDay) {
      const newAvailability = `${selectedDay} ${selectedTimeOfDay}`
      if (!availability.includes(newAvailability)) {
        setAvailability([...availability, newAvailability])
      }
      setSelectedDay('')
      setSelectedTimeOfDay('')
    }
  }

  const handleRemoveAvailability = (item: string) => {
    setAvailability(availability.filter(a => a !== item))
  }

  const handleApplyAvailabilityChanges = () => {
    showToast("Availability Updated", "Your availability has been updated successfully.")
    setAvailabilityModalOpen(false)
  }

  const handleSubmitTimeOffRequest = () => {
    setTimeOffStatus('pending')
    setTimeOffModalOpen(false)
    showToast("Time Off Request Submitted", "Your time off request has been submitted for approval.")
  }

  const handleActivateAccount = () => {
    setTimeOffStatus('active')
    setTimeOffModalOpen(false)
    showToast("Account Activated", "Your account has been activated. You are now eligible for future shifts.")
  }

  const showToast = (title: string, description: string) => {
    toast({
      title: title,
      description: description,
      duration: 3000,
    })
  }

  return (
    <div className="flex flex-col gap-8 bg-gray-25 p-8 xl:py-12">
      <div className="header-box">
        <h2 className="header-box-title">Quick Actions</h2>
        <p className="header-box-subtext">Manage your availability and requests</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Dialog open={availabilityModalOpen} onOpenChange={setAvailabilityModalOpen}>
          <DialogTrigger asChild>
            <Button className="text14_padding10 bg-[#191970] text-white shadow-form">Update Availability</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-20 font-semibold text-gray-900">Update Availability</DialogTitle>
              <DialogDescription className="text-14 text-gray-600">
                Set your availability for each day of the week.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day" className="text-right text-14 font-medium text-gray-700">
                  Day
                </Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="col-span-3 input-class">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm">
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeOfDay" className="text-right text-14 font-medium text-gray-700">
                  Time
                </Label>
                <Select value={selectedTimeOfDay} onValueChange={setSelectedTimeOfDay}>
                  <SelectTrigger className="col-span-3 input-class">
                    <SelectValue placeholder="Select time of day" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm">
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddAvailability} className="text14_padding10 bg-[#191970] text-white shadow-form">Add</Button>
            </div>
            <div className="space-y-2">
              {availability.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-14 text-gray-900">
                    {item}
                    {item.includes('Day') ? (
                      <SunIcon className="inline-block ml-2 h-4 w-4" />
                    ) : (
                      <MoonIcon className="inline-block ml-2 h-4 w-4" />
                    )}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveAvailability(item)} className="text-12 text-gray-700">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={handleApplyAvailabilityChanges} className="text14_padding10 bg-[#191970] text-white shadow-form">Apply Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={payStubsModalOpen} onOpenChange={setPayStubsModalOpen}>
          <DialogTrigger asChild>
            <Button className="text14_padding10 bg-[#191970] text-white shadow-form">View Pay Stubs</Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-20 font-semibold text-gray-900">Pay Stubs</DialogTitle>
              <DialogDescription className="text-14 text-gray-600">
                Please contact your Admin for your Stubs.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog open={timeOffModalOpen} onOpenChange={setTimeOffModalOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={timeOffStatus === 'pending'}
              variant={timeOffStatus === 'pending' ? 'secondary' : 'default'}
              className="text14_padding10 bg-[#191970] text-white shadow-form"
            >
              {timeOffStatus === 'active' && "Request Time Off"}
              {timeOffStatus === 'pending' && "Pending Time Off Request"}
              {timeOffStatus === 'inactive' && "Activate Account"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-20 font-semibold text-gray-900">
                {timeOffStatus === 'active' && "Request Time Off"}
                {timeOffStatus === 'inactive' && "Activate Account"}
              </DialogTitle>
              <DialogDescription>
                {timeOffStatus === 'active' && (
                  <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-14 font-semibold text-yellow-800">Warning</AlertTitle>
                    <AlertDescription className="text-14 text-yellow-700">
                      Submitting this request will make you ineligible for any shifts until the admin changes your status to active.
                    </AlertDescription>
                  </Alert>
                )}
                {timeOffStatus === 'inactive' && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <InfoIcon className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-14 font-semibold text-blue-800">Information</AlertTitle>
                    <AlertDescription className="text-14 text-blue-700">
                      Requesting your account to be active makes you eligible for future upcoming shifts.
                    </AlertDescription>
                  </Alert>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTimeOffModalOpen(false)} className="text14_padding10 text-gray-700">Cancel</Button>
              {timeOffStatus === 'active' && (
                <Button onClick={handleSubmitTimeOffRequest} className="text14_padding10 bg-[#191970] text-white shadow-form">Submit Request</Button>
              )}
              {timeOffStatus === 'inactive' && (
                <Button onClick={handleActivateAccount} className="text14_padding10 bg-[#191970] text-white shadow-form">Submit Request</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}