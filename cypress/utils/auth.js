import loginPage from "../pageObjects/loginPage"
let loginP = new loginPage()
const authEndpoint = 'api/oauth/login'

export const navigateToLoginPage = () => {

    cy.visit(Cypress.env('URL'), {timeout: 10000})
    cy.get('h1').should('contain.text', 'Sign in to your account')

}

export const loginWithEmail = (email, password) => {

    navigateToLoginPage()
    loginP.getEmail().type(email)
    loginP.getPassword().type(password)
}

export const successLoginResp = () => {

    cy.intercept('POST', authEndpoint,
        {
            statusCode: 200,
            headers: {
                'X-Authenticated': 'true',
                'content-type': 'application/json'
            }
        }).as('loginSuccess')
}

export const checkLocation = () => {
    cy.location().should((location) => {
        expect(location.pathname).to.not.eq('/login')
    })
}

export const successLoginRespCheck = () => {

    cy.wait('@loginSuccess').then(xhr => {
        expect(xhr.response.statusCode).to.equal(200)
    })
    checkLocation()
}

export const emailNotInDBResp = () => {
    cy.intercept('POST', authEndpoint,
        {
            statusCode: 400,
            body: {
                error: 'Please enter a valid email or password'
            }
        }).as('loginWithInvalidPass')
}

export const emailNotInDBErrorCheck = () => {

    cy.wait('@loginWithInvalidPass').then(xhr => {
        expect(xhr.response.statusCode).to.equal(400)
        expect(xhr.response.body.error).to.equal('Please enter a valid email or password')

    })
}

export const ssoRedirectCheck = () => {
    cy.intercept('GET', '/sso', (req) => {

        const location = `https://sso.example.com?redirectUrl=${encodeURIComponent(req.url)}`
        req.reply({
            statusCode: 302,
            headers: {
                'Location': `${location}`,
                'X-Authenticated': 'true',
                'content-type': 'application/json'
            }
        })


    })

}

export const ssoLoginDefine = (email) => {
    cy.intercept('POST', `api/oauth/sso/check?email=${email}`, (req) => {

        req.reply({
            statusCode: 200,
            body: {
                status: 'success',
                token: 'mocked-token'
            }
        })


    })
        .as('ssoLogin')

}

export const successSSOlogin = (requiredLink) => {

    cy.intercept('GET', `https://abtasty.com${requiredLink}`, (res) => {

        res.reply({
            statusCode: 302,
            headers: {
                'Location': `https://abtasty.com${requiredLink}`,
                'X-Authenticated': 'true',
                'content-type': 'application/json'
            }
        })


    })

}

export const maskedEmail = (email) => {

    const [username, domain] = email.split('@')
    const maskedUsername = username.slice(0, 1) + '*'.repeat(username.length - 1)
    const maskedDomain = domain.slice(0, 1) + "*".repeat(domain.length-5) + domain.slice(domain.lastIndexOf("."))
    return `${maskedUsername}@${maskedDomain}`

}

export const tripleClickToSignIn = () => {

    for (let i = 0; i < 3; i++) {
        loginP.getSubmitBtn().click()
    }

}

export const loginToRedirectToMfa = () => {

    cy.intercept(
        'POST', 'api/oauth/login', {

            statusCode: 200,
            headers: {
                'X-Authenticated': 'true',
                'content-type': 'application/json'
            },
            response: {
                redirectUrl: `${Cypress.env('URL')}/mfa`
            }
        }).as('loginRequestMfa')

}

export const mfaRequest = () => {

    cy.intercept(
        'POST', 'api/mfa', {

            statusCode: 200,
            headers: {
                'X-Authenticated': 'true',
                'content-type': 'application/json'
            },
            response: {
                success: true
            }
        }).as('mfaReq')

}

export const loginWithMFA = (email, pass, code) => {

    loginToRedirectToMfa()
    loginWithEmail( email , pass)
    loginP.getSubmitBtn().click()
    cy.wait('@loginRequestMfa')
    mfaRequest()
    loginP.fillMfa(code)

}

export const checkLoginPageElements = () => {

    cy.get('img').should('have.attr', 'src')
        .and('include', '/pulsar/c20ce34d69af..png')
    cy.contains('Sign in to your account').should('be.visible')
    loginP.getEmail().should('be.visible')
    loginP.getPassword().should('be.visible')
    loginP.getForgotYourPassLocator().should('be.visible')
    loginP.getSubmitBtn().should('be.visible')
    loginP.getSingInWithSSO().should('be.visible')
    cy.contains('Learn more about our Privacy Policy').should('be.visible')


}

