import React, { useRef, useState } from 'react'
// React router
import { Link, useNavigate } from 'react-router-dom'
// Firebase
import { FirebaseError } from 'firebase/app'
// Constants
import * as ROUTES from '../constants/routes'
// Material UI
import {
  Typography,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Container,
  Alert,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
// Components
import Copyright from '../components/Copyright'
// Context
import { useAuth } from '../context/authContext'

const theme = createTheme()

interface alertInterface {
  status: boolean
  message: string
}

export default function SignIn() {
  const emailRef = useRef<HTMLInputElement>()
  const passwordRef = useRef<HTMLInputElement>()

  const [emailErrorStatus, setEmailErrorStatus] = useState<alertInterface>({
    status: false,
    message: '',
  })
  const [passwordErrorStatus, setPasswordErrorStatus] = useState<alertInterface>({
    status: false,
    message: '',
  })

  const { signInUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emailVal = emailRef.current?.value
    const passwordVal = passwordRef.current?.value

    try {
      await signInUser(emailVal, passwordVal)
      navigate(ROUTES.MAIN)
    } catch (e) {
      console.log(e)
      if (e instanceof FirebaseError) {
        if (e.message.includes('internal-error')) {
          if (emailVal === '' || emailVal === undefined) {
            setEmailErrorStatus({ status: true, message: 'Sign in form is incompleted' })
          }
          if (passwordVal === '' || passwordVal === undefined) {
            setPasswordErrorStatus({ status: true, message: 'Sign in form is incompleted' })
          }
        }
        if (e.message.includes('auth/missing-email') || e.message.includes('auth/invalid-email')) {
          setEmailErrorStatus({ status: true, message: 'Please enter email adress' })
        }
        if (e.message.includes('auth/user-not-found')) {
          setEmailErrorStatus({ status: true, message: 'This user does not exist' })
        }
        if (e.message.includes('auth/wrong-password')) {
          setPasswordErrorStatus({ status: true, message: 'You have entered an invalid password' })
        }
        if (e.message.includes('auth/too-many-requests')) {
          setPasswordErrorStatus({
            status: true,
            message:
              'Access to this account has been temporarily disabled due to many failed login attempts.',
          })
        }
      }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='sm'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Box sx={{ marginBottom: '40px' }}>
              <Typography
                component='h1'
                variant='h4'
                align='left'
                sx={{ width: '100%', marginBottom: '8px' }}
              >
                Sign in to SPM
              </Typography>
              <Typography variant='body2' align='left' sx={{ width: '100%' }}>
                Enter your details below.
              </Typography>
            </Box>

            <Alert severity='info'>
              Use email : <b>demo@SPM.com</b> / password : <b>demo1234</b>
            </Alert>

            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              inputRef={emailRef}
              error={emailErrorStatus.status}
              onChange={(event) =>
                event.target.value !== ''
                  ? setEmailErrorStatus({ status: false, message: '' })
                  : undefined
              }
              helperText={emailErrorStatus.message}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              inputRef={passwordRef}
              error={passwordErrorStatus.status}
              onChange={(event) =>
                event.target.value !== ''
                  ? setPasswordErrorStatus({ status: false, message: '' })
                  : undefined
              }
              helperText={passwordErrorStatus.message}
            />
            <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
            <Grid container justifyContent='flex-end'>
              <Grid item>
                <Link to={ROUTES.SIGN_UP}>
                  <Typography variant='body2' color='primary'>
                    Don&apos;t have an account? Sign Up
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  )
}
