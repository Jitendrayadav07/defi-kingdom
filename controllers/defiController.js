const Response = require("../classes/Response");
const {ChatDeepSeek} = require("@langchain/deepseek");
const { ChatGroq } = require("@langchain/groq");

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  maxRetries: 2
});

let message = []
const communicateWithBot = async (req, res) => {
    try {
        if(!message.length)
            message = inMemory();


        console.log("message", message)
        message.push(["human", req.body.query])
        let aiMsg = await llm.invoke(message, {response_format: { type: "json_object" },})
        message.push(["assistant", aiMsg.content])

        return res.status(200).send(Response.sendResponse(true,JSON.parse(aiMsg.content),"", 200));
    } catch (error) {
        console.log(error)
        return res.status(500).send(Response.sendResponse(false, null, "", 500));
    }
};

const inMemory = (_message) => {
    try {
        const prompt = "You're a helpful assistant, Who is expert in playing Defi Kingdoms Game url for the game - https://docs.defikingdoms.com/gameplay/getting-started" + 
        " You're supposed to help others in getting started and giving information about the game " + 
        " You must answer that even any fifth grader would understand" + 
        " response only in json format " +
        " title, description, steps: can be array of objects with step number, title and description " 

        _message = [
            [
                "system",
                prompt,
            ]
        ]

        return _message;
    }catch(err) {
        console.log("err", err)
    }
}

const formattingLLMResponse = (_data) => {
    let responseString = _data.replaceAll("`", "").replace("json", "");
    let bracket = responseString.indexOf("{");
    let endBracket = responseString.indexOf("}");
    let formattedeString = responseString.substring(bracket, endBracket + 1);
    return formattedeString;
  };


module.exports = { communicateWithBot };
