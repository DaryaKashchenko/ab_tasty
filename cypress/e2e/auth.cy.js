import loginPage from "../pageObjects/loginPage"
import {
    navigateToLoginPage,
    loginWithEmail,
    emailNotInDBResp,
    emailNotInDBErrorCheck,
    successLoginResp,
    successLoginRespCheck,
    ssoRedirectCheck,
    ssoLoginDefine,
    successSSOlogin,
    checkLocation,
    maskedEmail,
    tripleClickToSignIn,
    loginWithMFA, checkLoginPageElements
} from "../utils/auth"
const dataset = require('../utils/testData.json')
let loginP

describe('Authorization functional',
    function () {

        loginP = new loginPage()

        Cypress.on('uncaught:exception', () => {
            return false
        })

        describe('check login with email and password', function () {

            it('check the link of login page', function () {

                navigateToLoginPage()
                cy.url().should('include', '/login')

            })

            it('valid email/pass - mocked', function () {

                successLoginResp()
                loginWithEmail(Cypress.env('USER1'), Cypress.env('PASS1'))
                loginP.getSubmitBtn().click()
                successLoginRespCheck()

            })

            it('check if email and pass empty - sign in btn is disabled', function () {

                navigateToLoginPage()
                cy.url().should('include', '/login')
                loginP.getSubmitBtn().should('be.disabled')

            })

            it('email not in DB - mocked', function () {

                emailNotInDBResp()
                loginWithEmail(Cypress.env('EMAILNOTINDB'), Cypress.env('PASS1'))
                loginP.getSubmitBtn().click()
                emailNotInDBErrorCheck()


            })

            it('invalid email check', function () {

                const invalidEmail = 'useryahoo'
                navigateToLoginPage()
                loginP.getEmail().type(invalidEmail)
                loginP.getPassword().click()
                loginP.validationErrorEmail()

            })

            it('Password is incorrect for user', function () {

                const incorrectPass = 'Password1234543!'
                loginWithEmail(Cypress.env('USER1'), incorrectPass)
                loginP.getSubmitBtn().click()
                loginP.validationErrorEmail()
            })

            it('invalid password for non-SSO user', function () {

                const invalidPass = '1234'
                loginWithEmail(Cypress.env('USER1'), invalidPass)
                loginP.getSubmitBtn().click()
                loginP.validationErrorEmail()
            })

        })

        describe('check SSO and Google login', function () {

            it('SSO recognized user redirected - mocked', function () {

                successLoginResp()
                navigateToLoginPage()
                loginP.getEmail().type(Cypress.env('EMAILSSODOMEN'))
                ssoRedirectCheck()

            })

            it('SSO login redirection to AB Tasty platform - mocked', function () {

                navigateToLoginPage()
                loginP.signWithSSOclick()
                cy.url().should('contain', '/ssologin')
                ssoLoginDefine(Cypress.env('EMAILSSODOMEN'))
                loginP.typeEmail(Cypress.env('EMAILSSODOMEN'))
                loginP.getSubmitBtn().click()
                successSSOlogin('/ABTastyPlatform')
                checkLocation()

            })

            it ('login with Google - mocked', function () {

                const googleCred = {
                    email: 'testovtesttest11111@gmail.com',
                    password: 'Qwerty123!'
                }

                navigateToLoginPage()
                cy.get('#GOOGLE_SIGN_IN_BUTTON').dblclick()
                cy.on('window:alert', () => {
                    cy.url().should('include', 'https://accounts.google.com')
                    cy.get('#identifierId').type(googleCred.email)
                    cy.contains('Далее').click()
                    cy.get('input[type="password"]').type(googleCred.password)
                    cy.contains('Далее').click()
                })
                ssoRedirectCheck()

            })

        })

        describe ('reset login functional', function (){

            it('Password reset link to valid account', function () {

                navigateToLoginPage()
                loginP.getForgotYourPass()
                cy.url().should('include', '/reset-password')
                loginP.typeEmail(Cypress.env('USER1'))
                loginP.getSubmitBtn().click()
                console.log(maskedEmail(Cypress.env('USER1')))
                loginP.checkSuccessAlertText(maskedEmail(Cypress.env('USER1')))
                loginP.checkParagraphText()
            })

            it('Password reset link - email validation', function () {

                navigateToLoginPage()
                loginP.getForgotYourPass()
                cy.url().should('include', '/reset-password')
                loginP.typeEmail('yahoo')
                loginP.getSubmitBtn().click()
                loginP.validationErrorEmail()


            })

        })

        describe ('captcha functional', function () {

            it('Captcha after 3 attempts check', function () {

                const incorrectPass = 'Password1234543!'
                loginWithEmail(Cypress.env('USER1'), incorrectPass)
                tripleClickToSignIn()
                loginP.checkCaptchaIsShown()


            })

            it('Login with invalid captcha check', function () {

                const incorrectPass = 'Password1234543!'
                loginWithEmail(Cypress.env('USER1'), incorrectPass)
                tripleClickToSignIn()
                loginP.getCaptcha()
                    .invoke('removeAttr', 'style')
                    .click()

                // cy.get('iframe[title="reCAPTCHA"]').then($iframe => {
                //     const $body = $iframe.contents().find('body')
                //     cy.wrap($body).as('iframeBody')
                // })
                // cy.get('@iframeBody').find('div[role="checkbox"]').click()
                // cy.get('@iframeBody').find('#recaptcha-verify-button').click()


            })

        })

        describe ('MFA functional', function () {

            for (const data of dataset )
                it(`MFA code requirement for ${data.email} user - mocked`,
                    function () {

                        loginWithMFA(data.email, data.password, data.code)
                        loginP.getSubmitBtn().click()
                        cy.wait('@mfaReq')
                        cy.url().should('eq', '/ABTastyPlatform')

                    })

            it ('Save the device for MFA', function () {

                loginWithMFA(dataset[0].email, dataset[0].password, dataset[0].code)
                loginP.rememberDevice()
                loginP.checkCheckbox()
                loginP.getSubmitBtn().click()
                cy.wait('@mfaReq')

            })

            it ('MFA code expiration', function () {

                loginWithMFA(dataset[0].email, dataset[0].password, dataset[0].code)
                cy.wait(60000)
                loginP.getSubmitBtn().click()
                cy.wait('@mfaReq')
                expect(cy.contains('Whooops! The code you entered is incorrect. Please try again.')).to.be.visible()

            })

            it ('Resend the MFA code', function () {

                loginWithMFA(dataset[0].email, dataset[0].password, dataset[0].code)
                loginP.resendTheCode()
                loginP.getSubmitBtn().click()
                cy.wait('@mfaReq')
                cy.url().should('eq', '/ABTastyPlatform')


            })

        })

        describe('check elements of the login page and navigation to login page', function () {

            it('Show/hide password toggle button', function () {

                navigateToLoginPage()
                loginP.getPassword().type(Cypress.env('PASS1'))
                loginP.getEyeIcon().click()
                loginP.getPassword()
                    .should('have.attr', 'type', 'text')
                loginP.getStrikethroughtEyeIcon().click()
                loginP.getPassword()
                    .should('have.attr', 'type', 'password')


            })

            it ('Navigate from SSO form back to Email/password', function () {

                navigateToLoginPage()
                loginP.signWithSSOclick()
                cy.url().should('contain', '/ssologin')
                loginP.returnBackFromSSO()
                cy.url().should('contain', '/login')


            })

            it ('Navigate from MFA form back to Email/password', function () {

                loginWithMFA(dataset[0].email, dataset[0].password, dataset[0].code)
                loginP.returnBackFromMFA()
                cy.url().should('contain', '/login')


            })

            it ('Check the browser width is more than 1024px',
                function () {

                    navigateToLoginPage()
                    cy.viewport(1200, 800)
                    cy.window().then((win) => {
                        expect(win.innerWidth).to.be.greaterThan(1024)
                    })
                    checkLoginPageElements()
                    cy.screenshot('width more 1024')


                })

            it ('Check the browser width is less than 1024px',
                function () {

                    navigateToLoginPage()
                    cy.viewport(800, 600)
                    cy.window().then((win) => {
                        expect(win.innerWidth).to.be.lessThan(1024)
                    })
                    checkLoginPageElements()
                    cy.screenshot('width less 1024')

                })
        })

    })
