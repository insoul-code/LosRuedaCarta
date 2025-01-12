import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  AuthFlowType,
  CodeMismatchException,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  NotAuthorizedException,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  UserNotConfirmedException
} from "@aws-sdk/client-cognito-identity-provider";
import { CookieService } from 'ngx-cookie-service';

export interface IUser {
  email: string;
  name: string;
  role: string;
  sub: string;
}

@Injectable({
  providedIn: 'root',
})
export class CognitoService {
  client:any;

  constructor(private cookieService: CookieService){
    this.client = new CognitoIdentityProviderClient({
      region: environment.cognito.region
    });
  }

  public async signUp(password: string, email: string, name: string) {
    const command = new SignUpCommand({
      ClientId: environment.cognito.userPoolWebClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
        { Name: "role", Value: 'ADMIN'}
      ]
    });

    const { UserSub, $metadata } = await this.client.send(command);

    if ($metadata.httpStatusCode == 200) {
      return UserSub;
    } else {
      throw new Error('Falló el registro.');
    }
  }

  public async confirmSignUp(code: string, email: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: environment.cognito.userPoolWebClientId,
      Username: email,
      ConfirmationCode: code,
    });

    try{
      await this.client.send(command);
    } catch(error: CodeMismatchException | any) {
      throw new Error(error.name);
    }
  }

  public async signIn(password: string, email: string) {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
      ClientId: environment.cognito.userPoolWebClientId
    });

    try{
      const { AuthenticationResult } = await this.client.send(command);
      this.cookieService.set('refreshToken', AuthenticationResult.RefreshToken);
      this.cookieService.set('accessToken', AuthenticationResult.AccessToken);
      return AuthenticationResult;
    } catch(error: UserNotConfirmedException | NotAuthorizedException | any) {
      throw new Error(error.name);
    }


  }

  public async getUser(): Promise<IUser | any> {
    const command = new GetUserCommand({
      AccessToken: this.cookieService.get('accessToken')
    });

    try{
      const { UserAttributes } = await this.client.send(command);
      return {
        name: UserAttributes.find((a: { Name: string; }) => a.Name === 'name')?.Value,
        role: UserAttributes.find((a: { Name: string; }) => a.Name === 'custom:role')?.Value,
        email: UserAttributes.find((a: { Name: string; }) => a.Name === 'email')?.Value,
        sub: UserAttributes.find((a: { Name: string; }) => a.Name === 'sub')?.Value,
      } as IUser;
    } catch(error: NotAuthorizedException | any) {
      if(error === NotAuthorizedException){
        this.refreshToken().then(__=>{
          return this.getUser();
        })
      }else{
        throw new Error(error.name);
      }
    }
  }

  public async resendCode(email: string) {
    const command = new ResendConfirmationCodeCommand({
      ClientId: environment.cognito.userPoolWebClientId,
      Username: email,
    });

    const { $metadata } = await this.client.send(command);

    if ($metadata.httpStatusCode == 200) {
      return 'Se ha reenviado el código al correo.';
    } else {
      throw new Error('Falló el reenvio del código de confirmación.');
    }
  }

  public async signOut() {
    this.refreshToken().then(async __=>{
      const command = new GlobalSignOutCommand({
        AccessToken: this.cookieService.get('accessToken'),
      });

      const { $metadata } = await this.client.send(command);

      if ($metadata.httpStatusCode == 200) {
        return 'Se ha cerrado la sesión.';
      } else {
        throw new Error('Falló el cirre de la sesión.');
      }
    })

  }
  public async refreshToken() {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      AuthParameters: {
        REFRESH_TOKEN: this.cookieService.get('refreshToken')
      },
      ClientId: environment.cognito.userPoolWebClientId,
    });

    const { AuthenticationResult, $metadata } = await this.client.send(command);
    this.cookieService.set('refreshToken', AuthenticationResult.RefreshToken);
    this.cookieService.set('accessToken', AuthenticationResult.AccessToken);
    if ($metadata.httpStatusCode == 200) {
      return AuthenticationResult;
    } else {
      throw new Error('Falló el inicio de sesión.');
    }

  }
}
