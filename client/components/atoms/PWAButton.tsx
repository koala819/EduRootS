'use client'

import { motion } from 'framer-motion'
import { Download, InfoIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { IOSInstallInstructionsClient } from '@/client/components/atoms/IOSInstallInstructions'
import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert'
import { Button } from '@/client/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/client/components/ui/tooltip'

type Platform = 'desktop' | 'mobile' | 'ios' | 'unknown'

export const PWAButtonClient: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false)
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const detectPlatform = (): Platform => {
      const ua = window.navigator.userAgent.toLowerCase()
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        return 'ios'
      }
      if (ua.includes('android')) {
        return 'mobile'
      }
      if (
        ua.includes('windows') ||
        ua.includes('macintosh') ||
        ua.includes('linux')
      ) {
        return 'desktop'
      }
      return 'unknown'
    }

    const checkStandalone = () => {
      // Vérifier si l'app est déjà installée
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')

      setIsStandalone(isStandaloneMode)
    }

    // Écouter l'événement beforeinstallprompt pour capturer l'installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Écouter l'événement appinstalled pour détecter l'installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setCanInstall(false)
      setIsStandalone(true)
    }

    const platform = detectPlatform()
    setPlatform(platform)
    checkStandalone()

    // Auto-afficher les instructions pour iOS (pas d'événement beforeinstallprompt)
    if (platform === 'ios') {
      setShowInstructions(true)
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Vérifier périodiquement si l'app est en mode standalone
    const checkStandaloneInterval = setInterval(() => {
      checkStandalone()
    }, 5000) // Vérifier toutes les 5 secondes

    return () => {
      clearInterval(checkStandaloneInterval)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const getInstallInstructions = () => {
    switch (platform) {
    case 'ios':
      return {
        title: 'Installer sur iOS',
        description: 'Appuyez sur le bouton de partage ⬆️ puis "Sur l\'écran d\'accueil" ➕',
        icon: '📱',
      }
    case 'mobile':
      return {
        title: 'Installer sur Android',
        description: 'Cliquez sur l\'icône d\'installation dans la barre d\'adresse ou le menu',
        icon: '📱',
      }
    case 'desktop':
      return {
        title: 'Installer l\'application',
        description: 'Cliquez sur l\'icône d\'installation dans la barre d\'adresse',
        icon: '💻',
      }
    default:
      return {
        title: 'Installer l\'application',
        description: 'Utilisez l\'icône d\'installation de votre navigateur',
        icon: '🌐',
      }
    }
  }

  const handleInstallClick = async () => {

    if (deferredPrompt && canInstall) {
      // Déclencher l'installation automatique
      deferredPrompt.prompt()

      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setCanInstall(false)
      }
    } else {
      setShowInstructions(true)
    }
  }

  const handleDismissInstructions = () => {
    setShowInstructions(false)
  }

  // Si l'app est déjà installée, ne rien afficher
  if (isStandalone) {
    return null
  }

  const instructions = getInstallInstructions()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 mt-2"
    >
      {showInstructions && (
        <Alert className="bg-secondary/10 border-secondary/20">
          <InfoIcon className="h-4 w-4 text-secondary" />
          <AlertTitle className="text-secondary">{instructions.title}</AlertTitle>
          <AlertDescription className="whitespace-pre-line pt-2 text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-lg">{instructions.icon}</span>
              <span>{instructions.description}</span>
            </div>

            {platform === 'ios' && (
              <div className="mt-3">
                <IOSInstallInstructionsClient isInstalled={false} />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissInstructions}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Fermer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative"
            >
              <Button
                onClick={handleInstallClick}
                className="w-full font-bold py-2 px-4 rounded-lg transition-all duration-300
                  flex items-center justify-center gap-2 cursor-pointer
                  bg-gradient-to-r from-secondary to-secondary-light
                  hover:from-secondary-dark hover:to-secondary
                  shadow-md hover:shadow-lg
                  text-secondary-foreground"
              >
                <Download className="h-5 w-5" />
                <span>
                  {canInstall ? 'Installer l\'application' : 'Installer l\'application'}
                </span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-foreground text-primary-foreground p-2"
          >
            <p>
              {canInstall
                ? 'Cliquez pour installer l\'application directement'
                : 'Accédez plus rapidement à l\'application'
              }
            </p>
          </TooltipContent>
        </Tooltip>

        {!showInstructions && !canInstall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex justify-center mt-2"
          >
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground
                flex items-center gap-1 cursor-pointer"
              onClick={() => setShowInstructions(true)}
            >
              <InfoIcon className="h-3 w-3" />
              <span>Plus d&apos;informations</span>
            </Button>
          </motion.div>
        )}
      </TooltipProvider>
    </motion.div>
  )
}
