'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'

interface UploadBtnProps {
  
}

const UploadBtn = ({}: UploadBtnProps) => {
 const [isOpen ,setIsOpen]= useState<boolean>(false)
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        setIsOpen(v)
      }}
    >
      <DialogTrigger asChild onClick={()=>setIsOpen(true)}>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>
        Example content
      </DialogContent>
    </Dialog>
  )
}

export default UploadBtn
