import { Response } from "express";

const addTokenToCookies = async (res: Response, token: { access_token: string, refresh_token: string }) => {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    res.cookie("auth.access_token", token.access_token, { httpOnly: true, expires: expirationDate })
    res.cookie("auth.refresh_token", token.refresh_token, { httpOnly: true, maxAge: -1 })
}

export default addTokenToCookies