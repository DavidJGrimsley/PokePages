"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AIController_1 = require("./AIController");
const aiRouter = (0, express_1.Router)();
aiRouter.post('/chat', AIController_1.chat);
exports.default = aiRouter;
