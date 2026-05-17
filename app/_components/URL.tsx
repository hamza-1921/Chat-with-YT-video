"use client"

import React from 'react'
import axios from 'axios';
import { useState } from 'react';


const URL = () => {
const [Url, setUrl] = useState<string>('')


const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendURL();
}

async function sendURL(){
    const response:any  = await axios.post('/api/Transcribe',{
        url:Url 
    })


    const result = await response.data ;
    

    console.log(result)
}



  return (
    <div>
      <form onSubmit={handleSubmit}>
      <input 
        value={Url} 
        onChange={(e) => setUrl(e.target.value)} 
        placeholder="Enter URL"
        onSubmit={handleSubmit}
      />
      </form>
    </div>
  )
}


export default URL
