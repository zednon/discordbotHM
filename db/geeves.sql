CREATE TABLE IF NOT EXISTS 'template' ('guild' TEXT NOT NULL, 'name' TEXT NOT NULL, 'type' INT NOT NULL);
CREATE TABLE IF NOT EXISTS "awayTimers" (
"guild"TEXT NOT NULL,
"mRoleId"TEXT NOT NULL,
"lifeTime"INTEGER NOT NULL,
"what"TEXT NOT NULL,
"who"TEXT NOT NULL,
"fromWho" TEXT);
CREATE TABLE IF NOT EXISTS 'management' (
"guild" TEXT NOT NULL,
"extraRoles" TEXT DEFAULT "[]");
CREATE TABLE IF NOT EXISTS "channels" (
"guild" TEXT NOT NULL,
"channelId" TEXT NOT NULL,
"mRoleId" TEXT NOT NULL,
"lRoleId" TEXT NOT NULL,
"cType" INT NOT NULL);
CREATE TABLE IF NOT EXISTS "whiteStar" (
"guild" TEXT NOT NULL,
"mRoleId" TEXT NOT NULL,
"lifeTime" INTEGER NOT NULL,
"awayMsgId" TEXT,
"awayChId" TEXT, 
"opponents" TEXT DEFAULT "[]",
"colour" INTEGER,
"novaDone" INTEGER NOT NULL DEFAULT 0);
