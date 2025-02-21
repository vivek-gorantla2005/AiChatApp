import UserManagement from "../controller/userController";
import { FriendManagement } from "../controller/FriendManagement";
import { HandleChats } from "../controller/chatManagement";
import { Messages } from "../kafkaService/producer";
import { Router } from "express";


export const router  = Router();

router.post('/signUp',UserManagement.signUp)
router.post('/login',UserManagement.login)
router.post('/sendFriendReq',FriendManagement.addFriends)
router.post('/addFriend',FriendManagement.acceptReq)
router.get('/getFriends',FriendManagement.getFriends)
router.post('/sendMessage',Messages.sendMessage)
router.get('/getChats',HandleChats.getMessages)

