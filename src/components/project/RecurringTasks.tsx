import React, { useEffect, useRef, useState } from 'react'
// Material-UI
import {
  Skeleton,
  Card,
  Typography,
  TextField,
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
// Firebase
import { updateProjectByCode } from '../../services/firebase'
// npm packages
import moment from 'moment'
// Types
import { IProject, IRecurringTask } from '../../store/features/project/project.types'
// Components
import RecurringTasksList from './RecurringTasksList'
// Constants
import * as ALERTS from '../../constants/alerts'
import { cloneDeep, now } from 'lodash'

interface Props {
  project: IProject
  refetch: () => void
}

export default function RecurringTasks({ project, refetch }: Props) {
  const { code, recurringTasks } = project

  const [taskTextError, setTaskTextError] = useState(false)
  const [taskTimeError, setTaskTimeError] = useState(false)
  const taskTextRef = useRef<HTMLInputElement>()
  const taskTimeRef = useRef<HTMLInputElement>()
  const [recurringTasksList, setRecurringTasksList] = useState<IRecurringTask[]>(recurringTasks)

  const [openList, setOpenList] = useState(false)

  const createRecurringTaskButtonHandler = async () => {
    if (code && taskTextRef.current !== undefined && taskTimeRef.current !== undefined) {
      if (taskTextRef.current.value !== '' && taskTimeRef.current.value !== '') {
        // Convert input time to milliseconds
        const hour = parseInt(taskTimeRef.current.value.slice(0, 2))
        const minute = parseInt(taskTimeRef.current.value.slice(-2))
        const time = moment().set('h', hour).set('m', minute).add(1, 'd').valueOf()
        // Task object
        const recurringTask = {
          task: taskTextRef.current.value,
          time: time,
          done: true,
        }
        // Push new task to recurringTasks if it exist
        // If recurringTasks does not exist then create a new array with recurringTask
        let newRecurringTasks = [...recurringTasksList]
        newRecurringTasks !== undefined
          ? newRecurringTasks.push(recurringTask)
          : (newRecurringTasks = [recurringTask])
        // Push new task to Firestore
        try {
          await updateProjectByCode(code, { recurringTasks: newRecurringTasks })
          // Clear input fields
          taskTextRef.current.value = ''
          taskTimeRef.current.value = ''

          setRecurringTasksList(newRecurringTasks)
        } catch (error) {
          console.log(error)
        }
      }
      taskTimeRef.current.value === '' && setTaskTimeError(true)
      taskTextRef.current.value === '' && setTaskTextError(true)
    }
  }

  const deleteHandler = (code: number, index: number) => {
    const newRecurringTasks = cloneDeep(recurringTasksList)
    newRecurringTasks.splice(index, 1)
    updateProjectByCode(code, { recurringTasks: newRecurringTasks }).then(() =>
      setRecurringTasksList(newRecurringTasks),
    )
  }

  const doneCheckboxHandler = (code: number, item: IRecurringTask, index: number) => {
    const newRecurringTasks = cloneDeep(recurringTasksList)
    newRecurringTasks[index]['done'] = !item.done
    updateProjectByCode(code, { recurringTasks: newRecurringTasks }).then(() =>
      setRecurringTasksList(newRecurringTasks),
    )
  }

  // Open table if recurringTasks exist and if it has any items
  function openListHandler() {
    if (recurringTasksList !== undefined && recurringTasksList.length > 0) {
      setOpenList(!openList)
    }
  }

  useEffect(() => {
    if (recurringTasksList.length === 0) {
      setOpenList(false)
    }
    refetch()
  }, [recurringTasksList])

  useEffect(() => {
    const newRecurringTasks = cloneDeep(recurringTasksList)
    newRecurringTasks.forEach((task, index) => {
      if (task.time - now() < 0 && code !== undefined && code !== null) {
        newRecurringTasks[index]['done'] = false
        while (task.time - now() < 0) {
          newRecurringTasks[index]['time'] = moment(task.time).add(1, 'd').valueOf()
        }
        updateProjectByCode(code, { recurringTasks: newRecurringTasks }).then(() =>
          setRecurringTasksList(newRecurringTasks),
        )
      }
    })
  }, [])

  return (
    <>
      {code === null ? (
        <Skeleton height={350} />
      ) : (
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: {
              xs: 2,
              sm: 3,
            },
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h6'>Recurring Tasks</Typography>
            <Tooltip
              disableFocusListener
              title='Checkbox will automatically deselect every 24h on selected time'
            >
              <IconButton>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              gap: 2,
              '.MuiTextField-root': {
                '&:nth-of-type(1)': {
                  width: {
                    xs: '100%',
                    sm: '70%',
                  },
                },
                width: {
                  xs: '100%',
                  sm: '30%',
                },
              },
            }}
          >
            <TextField
              id='task-text-input'
              label='Task'
              variant='filled'
              inputRef={taskTextRef}
              error={taskTextError}
              helperText={taskTextError ? ALERTS.EMPTY_FIELD : ''}
              onChange={() => setTaskTextError(false)}
            />
            <TextField
              id='task-time-input'
              label='Repeat at'
              variant='filled'
              type='time'
              defaultValue='07:30'
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              sx={{ width: 150 }}
              inputRef={taskTimeRef}
              error={taskTimeError}
              helperText={taskTimeError ? ALERTS.EMPTY_FIELD : ''}
              onChange={() => setTaskTimeError(false)}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'end',
            }}
          >
            <Button
              id='display-list-btn'
              variant='text'
              sx={{ mt: 2, mr: 1 }}
              disabled={recurringTasksList.length === 0}
              onClick={() => openListHandler()}
            >
              Show Tasks
            </Button>
            <Button
              id='add-item-to-list-btn'
              variant='contained'
              sx={{ mt: 2 }}
              onClick={() => createRecurringTaskButtonHandler()}
            >
              Create Task
            </Button>
          </Box>
          <Box>
            <RecurringTasksList
              recurringTasksList={recurringTasksList}
              code={code}
              open={openList}
              deleteHandler={deleteHandler}
              doneCheckboxHandler={doneCheckboxHandler}
            />
          </Box>
        </Card>
      )}
    </>
  )
}
