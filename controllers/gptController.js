const OpenAI = require('openai');
require('dotenv').config()




const diagnosis = async(message)=>{
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    try{
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                "role": "system",
                "content": "Based on the provided transcript snippets from a doctor-patient consultation, parse the information to generate a differential diagnosis. The results should be organized as follows:\nDifferential Diagnosis: List each possible diagnosis with a model confidence score from 0-100 (example: [30]), 100 being most confident.\nPlease consider the patient's stated symptoms, their medical history, and any other relevant information presented in the transcript. The consultation snippets are as follows:"
              },
              {
                "role": "user",
                "content": `${message}`
              },
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });
  
        formattedMsg=response.choices[0].message.content
        console.log(formattedMsg)
        return formattedMsg;

    }
    catch(err){
        console.log(err)
    }
}

const relatedQuestions = async(message)=>{
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    try{
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                "role": "system",
                "content": `Based on the provided transcript snippets from a doctor-patient consultation, internally generate a differential diagnosis based on the patient's stated symptoms, their medical history, and any other relevant information presented in the transcript. Then, suggest potential questions the doctor could ask to facilitate the diagnosis process. The questions should be aimed at clarifying the diagnosis or gathering more information to refine the differential diagnosis. BUT DO NOT OUTPUT THE differential diagnosis. \nThe results should be formatted as follows:\nQuestions to Ask: Provide a list of top 3 relevant questions the doctor could ask to further clarify the diagnosis. The question is succint and short.\nThe consultation snippets are as follows:`
              },
              {
                "role": "user",
                "content": `${message}`
              },
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

        formattedMsg=response.choices[0].message.content
        console.log(formattedMsg)
        return formattedMsg;

    }
    catch(err){
        console.log(err)
    }
}

const clinicalNote = async({transcript, hint})=>{
    let prompt = `
    Based on the conversation transcript and doctor's hints provided below, generate a clinical note in the following format:
    Diagnosis:
    History of Presenting Illness:
    Medications (Prescribed): List current medications and note if they are being continued, or if any new ones have been added.
    Lab Tests (Ordered):
    Please consider any information in the transcript that might be relevant to each of these sections, and use the doctor's hint as a guide.

    ### Example
    Conversation Transcript:
    Patient: “I've been taking the Glycomet-GP 1 as you prescribed, doctor, but I'm still feeling quite unwell. My blood pressure readings are all over the place and my sugar levels are high.”
    Doctor: “I see, we may need to adjust your medications. Let's add Jalra-OD and Telmis to your regimen and see how you respond.”
    Doctor's Hint: The patient has uncontrolled diabetes and hypertension despite adherence to the Glycomet-GP 1.
    Clinical Note:
    Diagnosis: Uncontrolled Diabetes and Hypertension
    History of Presenting Illness: The patient has been adhering to their current medication regimen but the diabetes and hypertension seem uncontrolled.
    Medications (Prescribed):
    [Continue] Glycomet-GP 1 (tablet) | Glimepiride and Metformin
    [Added] Jalra-OD 100mg (tablet) | Vildagliptin
    [Added] Telmis 20 (Tablet)
    Lab Tests (Ordered): None
    Now, based on the following conversation and hints, please generate a clinical note:

    ### Conversation Transcript
    ${transcript}

    ### Doctor's Hint
    ${hint}
    `
}

const gptChat = async (req,res)=>{
    
    try{
        messages=req.body.messages // convo arr 
        convo_arr=[{"role": "system", "content": `As a medical chatbot named EasyDocAI, your task is to answer patient questions about their prescriptions/consulatation with the doc (attaching the transript of the convo below) . You should provide complete, scientifically-grounded, and actionable answers to queries.
        Remember to introduce yourself as EasyDocAI only at the start of the conversation. 
        Transcript: Doc : hey what bring you here today 
        Patient : i am having pain in my elbow
        Doc: I see,. When did you first start experiencing this pain in your elbow?
        Patient: It started about a week ago. It's been bothering me quite a bit, especially when I try to lift things or straighten my arm.
        Doc: Have you noticed any specific activities or movements that make the pain worse?
        Patient: Yeah, it seems to really flare up when I'm lifting weights at the gym or even just carrying groceries.
        Doc: Okay, and have you had any injuries or trauma to your elbow recently?
        Patient: Not that I can recall. I mean, I might have bumped it a few times, but nothing serious.
        Doc: Alright. Let's take a look at your elbow. I'm going to perform a physical examination to assess the range of motion and any signs of inflammation or injury.
        (Doctor examines patient's elbow)
        Doc:, based on my examination, it seems like you might be experiencing tennis elbow, also known as lateral epicondylitis. It's a common condition caused by overuse of the muscles and tendons in the forearm and around the elbow joint.
        Patient: Oh, I've heard of that before. What can I do to relieve the pain?
        Doc: Well, initially, we'll start with some conservative treatments. I'd recommend resting your elbow and avoiding activities that aggravate the pain. You can also apply ice to the affected area for about 15-20 minutes several times a day to help reduce inflammation. Additionally, I'll prescribe a nonsteroidal anti-inflammatory drug (NSAID) like ibuprofen to help manage the pain and inflammation.
        Patient: Got it. How long do you think it'll take for the pain to go away?
        Doc: It varies from person to person, but with proper rest and treatment, most people start to feel better within a few weeks to a couple of months for now take buprofen: 400mg tablets, take one tablet every 6-8 hours as needed for pain, with food. Also advises continued rest and ice application. I'd like to see you back in two weeks to assess your progress and make any necessary adjustments to your treatment plan 
        Patient: Sounds good. Thanks, Doc.
`},...messages]
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
        const completion = await openai.chat.completions.create({
            messages:convo_arr,
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            model: "gpt-4",
          });

    
        const resi = completion.choices[0].message.content
        res.json({resi})
    }
    catch(err){
        console.log(err)
    }


}

module.exports = {
    diagnosis,
    relatedQuestions,
    gptChat
};





