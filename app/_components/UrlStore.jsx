"use client"

let currentUrl = ''

export const setUrl = (url) => { currentUrl = url }
export const getUrl = () => currentUrl

export default{setUrl,getUrl}