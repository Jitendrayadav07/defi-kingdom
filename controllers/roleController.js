const Response = require("../classes/Response");
const db = require("../config/db.config");
const ROLE_CONSTANTS_STATUS = require('../constants/roleConstants')

const createRole = async (req, res) => {
    try{
        let { role_name } = req.body
        let roleName = await db.roles.findOne({where: {role_name: role_name}});
        if (roleName) {
            return res.status(400).send(Response.sendResponse(false, null, ROLE_CONSTANTS_STATUS.ROLE_ALREADY_EXISTS, 400));
        }
        let role = await db.roles.create({role_name : role_name});

        // await userActivityLogger.logTagtalkActivity(req , req.user.id, "Role Created");
        return res.status(201).send(Response.sendResponse(true,role,null,201));
    }catch(err) {
        return res.status(500).send(Response.sendResponse(false,null,ROLE_CONSTANTS_STATUS.ERROR_OCCURED,500));
    }
}

const getRoles = async (req, res) => {
    try {
        let role = await db.roles.findAll();
        return res.status(200).send(Response.sendResponse(true,role,null,200));
    }catch(err){
        return res.status(500).send(Response.sendResponse(false,null,ROLE_CONSTANTS_STATUS.ERROR_OCCURED,500));
    }
}


module.exports = { 
    createRole, 
    getRoles
}


