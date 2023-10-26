const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainController');

router.get('/')

router.get('/create', controller.create )
router.get('/findFile', controller.findFile)
router.get('/SubfolderId', controller.SubfolderId)
router.get('/folders', controller.folders)

router.post('/LinkList', controller.LinkList)


module.exports = router;
