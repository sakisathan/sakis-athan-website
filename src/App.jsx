import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Bot, Mail, Phone, MessageCircle, Send, X, Volume2, VolumeX } from 'lucide-react'
import profileImage from './assets/sakis-profile.png'

import largeRobot from './assets/large-robot.gif'
import './App.css'

function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true) // New state for voice toggle

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // OpenAI API call will be implemented here
      const response = await fetch('https://3001-irufp8x2q57bpem5rfd6w-8e2afb88.manusvm.computer/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      
      // Enhanced Text-to-speech with much better voice quality (only if voice is enabled)
      if ('speechSynthesis' in window && voiceEnabled) {
        // Cancel any ongoing speech first
        speechSynthesis.cancel()
        
        // Wait for voices to load
        const speakWithBetterVoice = () => {
          const utterance = new SpeechSynthesisUtterance(data.response)
          const voices = speechSynthesis.getVoices()
          
          console.log('Voice enabled, attempting speech. Available voices:', voices.length)
          
          // Find the best quality voices - prioritize premium/neural voices
          const premiumVoices = voices.filter(voice => 
            voice.lang.startsWith('en') && (
              voice.name.includes('Premium') ||
              voice.name.includes('Neural') ||
              voice.name.includes('Enhanced') ||
              voice.name.includes('Natural') ||
              voice.name.includes('Samantha') ||
              voice.name.includes('Alex') ||
              voice.name.includes('Victoria') ||
              voice.name.includes('Daniel')
            )
          )
          
          // Fallback to high-quality system voices
          const qualityVoices = voices.filter(voice => 
            voice.lang.startsWith('en') && (
              voice.name.includes('Google') ||
              voice.name.includes('Microsoft') ||
              voice.name.includes('Apple')
            )
          )
          
          let selectedVoice = null
          
          // Try premium voices first
          if (premiumVoices.length > 0) {
            selectedVoice = premiumVoices[0]
          } else if (qualityVoices.length > 0) {
            // Prefer female voices for better user experience
            selectedVoice = qualityVoices.find(v => 
              v.name.toLowerCase().includes('female') || 
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('aria')
            ) || qualityVoices[0]
          } else if (voices.length > 0) {
            // Use any available English voice as fallback
            selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0]
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice
            utterance.rate = 0.85  // Slower for better clarity
            utterance.pitch = 1.1  // Slightly higher pitch for friendliness
            utterance.volume = 0.7 // Comfortable volume
            
            console.log('Using voice:', selectedVoice.name)
            speechSynthesis.speak(utterance)
          } else {
            console.log('No suitable voice found - using default voice')
            // Use default voice if no specific voice is found
            speechSynthesis.speak(utterance)
          }
        }
        
        // Ensure voices are loaded
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.addEventListener('voiceschanged', speakWithBetterVoice, { once: true })
        } else {
          speakWithBetterVoice()
        }
      } else {
        console.log('Voice disabled or speechSynthesis not available')
        // Cancel any ongoing speech when voice is disabled
        speechSynthesis.cancel()
      }
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact Sakis directly at aiagent@dr.com.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    const email = formData.get('email')
    const message = formData.get('message')
    
    try {
      // Google Sheets integration
      const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbyM1QqUKLzNtK7k-XSRafKC7lmsYSyGDKhL2GoM8zJC6Ma04B6fg9HjCKE5uGl5TcX_/exec'
      
      const response = await fetch(googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          message,
          timestamp: new Date().toISOString()
        }),
      })
      
      // Since we're using no-cors mode, we can't read the response
      // But we can assume success if no error is thrown
      alert(`Thank you ${name}! Your message has been sent successfully. I'll get back to you at ${email} soon.`)
      e.target.reset() // Clear the form
      
    } catch (error) {
      console.error('Contact form error:', error)
      alert('Sorry, there was an error sending your message. Please try again or contact me directly at aiagent@dr.com.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                AI Agent Engineer - Custom Automation Solutions
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100">
                Hi, I'm Sakis Athan, an expert AI Agent Engineer. I build intelligent systems that automate business processes, optimize workflows, and assist with real tasks — fast delivery, fair pricing, and 100% hands-on development.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                Let's Build Your AI Agent
              </Button>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-30 scale-110"></div>
                <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-white/20">
                  <img 
                    src={profileImage} 
                    alt="Sakis Athan - AI Agent Engineer" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">About Sakis Athan - AI Agent Engineer</h2>
            <div className="text-lg lg:text-xl text-gray-700 leading-relaxed space-y-6">
              <p>
                My name is <strong>Sakis Athan</strong>. I am a self-driven AI Agent Engineer who builds intelligent systems to automate real-world business tasks and optimize workflows.
              </p>
              <p>
                I deliver fast, useful, and custom-built AI automation solutions for individuals and businesses — combining the power of modern AI tools such as <strong>GPT</strong>, <strong>Claude</strong>, <strong>Manus</strong>, <strong>Perplexity</strong>, and more, with both traditional coding techniques (<strong>Visual Basic</strong>, <strong>Python</strong>, <strong>JavaScript</strong>) and my own style of <strong>vibe programming</strong> — a creative, intuitive approach to solving complex automation problems efficiently.
              </p>
              <p>
                I personally handle every step, from design to deployment, and I'm passionate about creating tools that truly help people work smarter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-16">
              AI Agent Development Services | What I Can Build for You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Custom AI agents for business, tasks, and communication",
                "GPT- or Claude-powered chatbots for websites or systems",
                "Workflow and data automation (email, Excel, reports)",
                "API integrations with platforms and tools",
                "Personalized LLM solutions using OpenAI and Anthropic",
                "Automations and much more"
              ].map((service, index) => {
                const gradients = [
                  "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500",
                  "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500", 
                  "bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500",
                  "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
                  "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
                  "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
                ];
                
                return (
                  <Card key={index} className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 overflow-hidden relative">
                    <div className={`absolute inset-0 ${gradients[index]} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className={`w-4 h-4 ${gradients[index]} rounded-full mt-2 flex-shrink-0 shadow-lg`}></div>
                        <p className="text-gray-800 leading-relaxed font-medium group-hover:text-gray-900 transition-colors duration-300">{service}</p>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${gradients[index]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-16">
              Real Business Problems I Solve with AI Automation
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Automate email writing and inbox sorting",
                "Create smart bots that answer questions 24/7",
                "Build tools that summarize documents, PDFs, or websites",
                "Connect apps through APIs for hands-free operation",
                "Develop voice-enabled assistants that speak answers"
              ].map((useCase, index) => {
                const problemGradients = [
                  "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
                  "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500",
                  "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500",
                  "bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500",
                  "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"
                ];
                
                const iconGradients = [
                  "from-emerald-400 to-cyan-400",
                  "from-violet-400 to-fuchsia-400", 
                  "from-amber-400 to-red-400",
                  "from-rose-400 to-purple-400",
                  "from-blue-400 to-purple-400"
                ];
                
                return (
                  <Card key={index} className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 overflow-hidden relative bg-white">
                    <div className={`absolute inset-0 ${problemGradients[index]} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${iconGradients[index]} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-800 leading-relaxed font-medium group-hover:text-gray-900 transition-colors duration-300">{useCase}</p>
                      </div>
                      <div className={`absolute top-0 left-0 right-0 h-1 ${problemGradients[index]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                      <div className={`absolute -top-2 -right-2 w-16 h-16 ${problemGradients[index]} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`}></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold">Contact AI Agent Engineer Sakis Athan</h2>
              <p className="text-xl text-gray-300">
                Ready to automate your business with custom AI agents? Let's discuss your AI automation project. I personally handle every development — no middlemen, no delays.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <span className="text-lg">aiagent@dr.com</span>
                </div>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white">Quick Contact</h3>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <Input 
                        name="name"
                        placeholder="Your Name" 
                        required 
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                      <Input 
                        name="email"
                        type="email" 
                        placeholder="Your Email" 
                        required 
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                      <Textarea 
                        name="message"
                        placeholder="Tell me about your AI project..." 
                        required 
                        rows={4}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Why Work With Me?</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <span>100% hands-on development - I personally code every solution</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <span>Fast delivery with fair pricing</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <span>Custom solutions tailored to your specific needs</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                    <span>Direct communication - no middlemen or delays</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 Sakis Athan — AI Agent Engineer
          </p>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen && (
          <div
            onClick={() => setChatOpen(true)}
            className="cursor-pointer hover:scale-110 transition-all duration-300 animate-bounce"
          >
            <img src={largeRobot} alt="AI Assistant" className="w-20 h-20" />
          </div>
        )}
        
        {chatOpen && (
          <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white flex-shrink-0">
              <div className="flex items-center space-x-2">
                <img src={largeRobot} alt="AI Assistant" className="w-8 h-8" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Cancel any ongoing speech immediately when toggling
                    if (voiceEnabled) {
                      speechSynthesis.cancel()
                    }
                    setVoiceEnabled(!voiceEnabled)
                  }}
                  className="text-white hover:bg-blue-700 h-8 w-8 p-0 rounded"
                  title={voiceEnabled ? "Disable voice" : "Enable voice"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  className="text-white hover:bg-blue-700 h-8 w-8 p-0 rounded"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    Hi! I'm Sakis's AI assistant. Ask me about his services, pricing, or anything else!
                  </div>
                )}
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-8'
                        : 'bg-gray-100 text-gray-800 mr-8'
                    }`}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                ))}
                {isLoading && (
                  <div className="bg-gray-100 text-gray-800 mr-8 p-3 rounded-lg text-sm">
                    Thinking...
                  </div>
                )}
              </div>
              
              <form onSubmit={handleChatSubmit} className="p-4 border-t flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="sm" disabled={isLoading}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

