"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    token: 'REPLACE_ME',
    intents: [1, 512],
    prefix: '!',
    admin: 'Discord Admin',
    environment: process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV,
    loggerLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    loggerOutput: 'console',
    dataPath: 'data'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFXYSxRQUFBLGFBQWEsR0FBbUI7SUFDNUMsS0FBSyxFQUFFLFlBQVk7SUFDbkIsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztJQUNqQixNQUFNLEVBQUUsR0FBRztJQUNYLEtBQUssRUFBRSxlQUFlO0lBQ3RCLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRO0lBQ3RGLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTztJQUNyRSxZQUFZLEVBQUUsU0FBUztJQUN2QixRQUFRLEVBQUUsTUFBTTtDQUNoQixDQUFBIn0=