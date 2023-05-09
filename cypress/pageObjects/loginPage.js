
class loginPage {

    getEmail() {
        return cy.getByTestId('email')

    }

    getPassword() {
        return cy.getByTestId('password')

    }

    getSubmitBtn(){
        return cy.get('button[type="submit"]')
    }

    validationErrorEmail() {
        cy.contains('Please enter a valid email').should('be.visible')
    }

    getSingInWithSSO() {
        return cy.contains('Sign in with SSO')
    }

    signWithSSOclick() {
        this.getSingInWithSSO().click()
    }

    typeEmail(email) {
        return cy.get('input[placeholder="name@abtasty.com"]').type(email)
    }

    getEyeIcon() {
        return cy.get('[data-testid="showIcon"]')
    }

    getStrikethroughtEyeIcon() {
        return cy.get('[data-testid="hideIcon"]')
    }

    getForgotYourPassLocator() {
       return cy.contains('Forgot your password?')
    }

    getForgotYourPass() {
        this.getForgotYourPassLocator().click()
    }

    checkSuccessAlertText(maskedEmail) {
        cy.contains(`We've sent an email to ${maskedEmail} with password reset instructions.`)
            .should('be.visible')

    }

    checkParagraphText() {
        cy.contains('You should receive an email from support@abtasty.com. If it is not the case, please check your spam folder. The link in the email will expire in 8 hours.')
            .should('be.visible')
    }

    getCaptcha() {
        return cy.get('iframe[title="reCAPTCHA"]')
    }

    checkCaptchaIsShown() {
        this.getCaptcha()
            .invoke('removeAttr', 'style')
            .should('be.visible')
    }

    fillMfa (mfaCode) {
        cy.get('#mfa-code').type(mfaCode)

    }

    rememberDevice () {
        cy.contains('Do not ask me for confirmation again for this device').click()

    }


    checkCheckbox() {
        cy.get('input[type="checkbox"]').should('be.checked')

    }

    returnBackFromSSO() {
        cy.contains('Sign in with email & password').click()

    }

    returnBackFromMFA() {
        cy.contains('Return to the login page').click()

    }

    resendTheCode() {
        cy.contains('Resend the code').click()

    }



}

export default loginPage