import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import nlp from 'compromise'

dotenv.config()
const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY
})
const openai = new OpenAIApi(configuration)

const app = express();
app.use(cors());
app.use(express.json())

app.get('/',async (req,res)=>{
    res.status(200).send({
        message:'Hello from RemAi'
    })
})
function preProcess(input){
    return input.replace(/[\/]/g, '');
}
app.post('/',async (req,res)=>{
    try{
        const prompt = req.body.prompt;
        let cleanedInput = preProcess(prompt);
        //Tokenize the prompt
         let doc = nlp(cleanedInput)
        doc.normalize({case:true, whitespace:true, possessives:false})
        // keep acronyms as uppercase
        doc.acronyms().toUpperCase()
        //remove parentheses
        //...uppercase the first letter of each sentence
        doc.terms(0).toTitleCase()
        //remove emoticons+emojis
        doc.remove('(#Emoticon|#Emoji)')
        //boom
        const preprocessedText =  doc.text()
        //const preprocessedText = doc.normalize().out('text');
        //Join the tokens
        console.log(preprocessedText)
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${preprocessedText}`,
            temperature: 0.7,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });
        // Send the response from the OpenAI API to the client
        res.status(200).send({
            bot:response.data.choices[0].text
        })
    }catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

app.listen(5000,()=>console.log('Server is running on http://localhost:5000'))
