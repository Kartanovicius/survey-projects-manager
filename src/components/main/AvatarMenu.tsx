import React, { useState } from 'react'
import { Avatar, Icon, Button, styled, Menu, Typography, Skeleton } from '@mui/material'
import { AvatarMenuItems } from './AvatarMenuItems'
import { useCurrentUser } from '../../context/currentUserContext'

const AvatarButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.background.paper[100],
    color: theme.palette.primary.main,
  },
  fontWeight: 'normal',
  border: 'none',
  textTransform: 'lowercase',
}))

function AvatarMenuContent() {
  const { userFirst, userLast, userEmailAddress } = useCurrentUser()
  const nameFirstLetter: string = userFirst?.charAt(0).toUpperCase()
  const surnameFirstLetter: string = userLast?.charAt(0).toUpperCase()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openAvatar = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      {userEmailAddress === undefined ? (
        <Skeleton width={226} height={42} />
      ) : (
        <AvatarButton onClick={handleClick}>
          <Icon sx={{ mr: 1, width: 30, height: 30 }}>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: 'primary.main',
                color: 'common.white',
                fontSize: 14,
              }}
            >
              {nameFirstLetter}
              {surnameFirstLetter}
            </Avatar>
          </Icon>
          <Typography variant='body2'>{userEmailAddress}</Typography>
        </AvatarButton>
      )}

      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={openAvatar}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundImage: 'none',
            overflow: 'visible',
            mt: 0.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <AvatarMenuItems setAnchorEl={setAnchorEl} />
      </Menu>
    </>
  )
}

export default function AvatarMenu() {
  return <AvatarMenuContent />
}
