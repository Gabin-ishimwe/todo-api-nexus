"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const schema_1 = require("./schema");
const context_1 = require("./context");
require("dotenv/config");
async function startApolloServer() {
    // Required logic for integrating with Express
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    // Same ApolloServer initialization as before, plus the drain plugin.
    const server = new apollo_server_express_1.ApolloServer({
        schema: schema_1.schema,
        context: context_1.context,
        csrfPrevention: true,
        cache: "bounded",
        plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await server.start();
    server.applyMiddleware({
        app,
        path: "/",
    });
    const port = process.env.NODE_ENV === "production" ? process.env.PORT : 4000;
    // Modified server startup
    await new Promise((resolve) => httpServer.listen({ port }, resolve));
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
}
startApolloServer();
//# sourceMappingURL=app.js.map