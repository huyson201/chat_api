import { Response } from "express";

const addTokenToCookies = async (res: Response, token: { access_token: string, refresh_token: string }) => {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    res.cookie("auth.access_token", token.access_token, { httpOnly: true, expires: expirationDate })
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    res.cookie("auth.refresh_token", token.refresh_token, { httpOnly: true, expires: expirationDate })
}

export default addTokenToCookies