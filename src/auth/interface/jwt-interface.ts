
export interface jwtPayload {

    id: string; //id del usuario
    iat?: number; // Fecha de creacion
    exp?: number //Fecha de expiracion

}