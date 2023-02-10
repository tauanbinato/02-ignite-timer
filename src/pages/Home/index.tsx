import { HandPalm, Play } from 'phosphor-react'
import { createContext, useState } from 'react'
import { NewCycleFormComponent } from './components/NewCycleForm'
import { CountdownComponent } from './components/Countdown'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import {
  HomeContainer,
  StartCountdownButton,
  StopCountdownButton,
} from './styles'

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptionDate?: Date
  finisedDate?: Date
}

interface CyclesContextType {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number

  setCurrentCycleAsFinished: () => void
  setSecondsPassed: (secondsPassed: number) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(1, 'O ciclo precisa ter pelo menos 5 minutos')
    .max(60, 'O ciclo precisa ter no máximo 60 minutos'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const newCycleForm = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { handleSubmit, watch, reset } = newCycleForm

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function setCurrentCycleAsFinished() {
    setCycles((state) => {
      return state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, finisedDate: new Date() }
        } else {
          return cycle
        }
      })
    })
  }

  function setSecondsPassed(secondsPassed: number) {
    setAmountSecondsPassed(secondsPassed)
  }

  function handleCreateNewCicle(data: NewCycleFormData) {
    const newId: string = String(new Date().getTime())
    const newCycle: Cycle = {
      id: newId,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }
    // Using arrow function to handle last tick
    setCycles((state) => [...state, newCycle])
    setActiveCycleId(newId)
    setAmountSecondsPassed(0)
    reset()
  }

  function handleInterruptActiveCycle() {
    setCycles((state) => {
      return state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptionDate: new Date() }
        } else {
          return cycle
        }
      })
    })

    setActiveCycleId(null)
  }

  const task = watch('task')
  const isSubmitDisabled = !task

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCicle)} action="">
        <CyclesContext.Provider
          value={{
            activeCycle,
            activeCycleId,
            setCurrentCycleAsFinished,
            amountSecondsPassed,
            setSecondsPassed,
          }}
        >
          <FormProvider {...newCycleForm}>
            <NewCycleFormComponent />
          </FormProvider>

          <CountdownComponent />
        </CyclesContext.Provider>

        {activeCycle ? (
          <StopCountdownButton
            type="button"
            onClick={handleInterruptActiveCycle}
            disabled={!activeCycle}
          >
            <HandPalm size={16} />
            <span>Interromper</span>
          </StopCountdownButton>
        ) : (
          <StartCountdownButton type="submit" disabled={isSubmitDisabled}>
            <Play size={24} />
            Começar
          </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  )
}
