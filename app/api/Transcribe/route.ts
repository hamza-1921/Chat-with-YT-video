import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from 'youtube-transcript';
//@ts-ignore
import { TokenTextSplitter } from "langchain/textsplitters";

export async function POST(req:NextRequest){
    const response = await req.json() ;
   const url = response.url ;

    const transcript:any = await fetchTranscript(url) ;

        
const splitter = new TokenTextSplitter({
  encodingName: "cl100k_base", 
  chunkSize: 500,
  chunkOverlap: 50,
})

const tokens = await splitter.splitText(transcript);





    return NextResponse.json({transcript,tokens})
}