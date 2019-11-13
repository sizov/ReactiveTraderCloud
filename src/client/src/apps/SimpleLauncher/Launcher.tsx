import React, { useEffect, useRef, useState } from 'react'
import { rules } from 'rt-styleguide'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { appConfigs } from './applicationConfigurations'
import { LaunchButton } from './LaunchButton'
import { LogoIcon } from 'rt-components'
import { createGlobalStyle } from 'styled-components'
import { styled, ThemeStorageSwitch } from 'rt-theme'
import { open } from './tools'
import { getOpenFinPlatform } from 'rt-platforms'
import { Bounds } from 'openfin/_v2/shapes'
import SearchIcon from './icons/searchIcon'

library.add(faSignOutAlt)

const INPUT_HEIGHT = 40

const exitHandler = async () => {
  const { OpenFin } = await getOpenFinPlatform()
  const platform = new OpenFin()
  return platform.window.close()
}

const LauncherGlobalStyle = createGlobalStyle`
:root, body {
  @media all {
    font-size: 16px;
    -webkit-app-region: drag;
  }
}
`

const LauncherExit = () => (
  <ButtonContainer key="exit">
    <LaunchButton onClick={exitHandler}>
      <FontAwesomeIcon icon="sign-out-alt" />
      <IconTitle>Exit</IconTitle>
    </LaunchButton>
  </ButtonContainer>
)

async function animateWindowSize(bounds: Bounds, duration: number = 200) {
  const window = await fin.Window.getCurrent()
  return window.animate(
    {
      size: {
        duration,
        height: bounds.height,
        width: bounds.width,
      },
    },
    {
      tween: 'ease-in-out',
      interrupt: true,
    },
  )
}

// async function changeWindowHeight(bounds: Bounds) {
//   const window = await fin.Window.getCurrent()
//   return window.resizeTo(
//     bounds.width,
//     bounds.height,
//     'top-left'
//   )
// }

const getWindowBounds = async () => {
  const window = await fin.Window.getCurrent()
  return window.getBounds()
}

export const Launcher: React.FC = () => {
  const [initialBounds, setInitialBounds] = useState<Bounds>()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getWindowBounds().then(setInitialBounds)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!isSearchVisible || !initialBounds) {
          return
        }
        setIsSearchVisible(false)
        animateWindowSize(initialBounds)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [initialBounds, isSearchVisible])

  const showSearch = async () => {
    if (isSearchVisible || !initialBounds) {
      return
    }
    setIsSearchVisible(true)
    await animateWindowSize({ ...initialBounds, height: initialBounds.height + INPUT_HEIGHT })
    searchInput.current && searchInput.current.focus()
  }

  const onInputChange = () => {
    if (!isSearchVisible || !initialBounds) {
      return
    }
    animateWindowSize(
      {
        ...initialBounds,
        height: initialBounds.height + INPUT_HEIGHT + Math.round(Math.random() * 10) * INPUT_HEIGHT,
      },
      75,
    )
  }

  const Spotlight = () => (
    <ButtonContainer>
      <LaunchButton onClick={showSearch}>{SearchIcon}</LaunchButton>
    </ButtonContainer>
  )

  return (
    <RootContainer>
      <LauncherGlobalStyle />
      <HorizontalContainer>
        <LogoContainer>
          <LogoIcon width={1.3} height={1.3} />
        </LogoContainer>
        <Spotlight />
        {appConfigs.map(app => (
          <ButtonContainer key={app.name}>
            <LaunchButton onClick={() => open(app)}>
              {app.icon}
              <IconTitle>{app.name}</IconTitle>
            </LaunchButton>
          </ButtonContainer>
        ))}
        <LauncherExit />
        <ThemeSwitchContainer>
          <ThemeStorageSwitch />
        </ThemeSwitchContainer>
      </HorizontalContainer>
      <Input ref={searchInput} onChange={onInputChange} />
    </RootContainer>
  )
}

const RootContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.core.lightBackground};
  overflow: hidden;
  color: ${({ theme }) => theme.core.textColor};
`

const HorizontalContainer = styled.div`
  height: 52px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const IconTitle = styled.span`
  position: absolute;
  bottom: 2px;
  right: 0;
  left: 0;
  text-align: center;
  font-size: 9px;
  font-family: Lato;
  color: transparent;
  transition: color 0.3s ease;

  /* avoids text highlighting on icon titles */
  user-select: none;
`

const IconContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  &:hover {
    span {
      color: ${({ theme }) => theme.core.textColor};
    }
  }
`

const ButtonContainer = styled(IconContainer)`
  ${rules.appRegionNoDrag};
`
const ThemeSwitchContainer = styled(ButtonContainer)`
  width: 35%;
`

const LogoContainer = styled(IconContainer)`
  width: 50%;
  background-color: ${({ theme }) => theme.core.lightBackground};
  .svg-icon {
    fill: ${({ theme }) => theme.core.textColor};
  }
  ${rules.appRegionDrag};
`

const Input = styled.input`
  padding: 8px;
  width: 100%;
  height: ${INPUT_HEIGHT}px;
  background: none;
  outline: none;
  border: none;
  font-size: 1.25rem;
  ${rules.appRegionNoDrag};
`
