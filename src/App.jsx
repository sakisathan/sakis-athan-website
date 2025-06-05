import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Bot, Mail, Phone, MessageCircle, Send, X, Volume2, VolumeX } from 'lucide-react'
import profileVideo from './assets/smiling_video.mp4'
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
      const response = await fetch('/.netlify/functions/chat', {
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
            utterance.rate = 0.85 // Slower for better clarity
            utterance.pitch = 1.1 // Slightly higher pitch for friendliness
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
                  <video
                    src={profileVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="profile-video"
                    alt="Sakis Athan - AI Agent Engineer"
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
                Whether you need an AI agent to handle customer inquiries, automate data processing, manage your calendar, or create custom workflows, I build solutions that work reliably and deliver real value to your business.
              </p>
              <p>
                <strong>Contact me at aiagent@dr.com</strong> to discuss your AI automation needs. I offer competitive pricing, fast turnaround times, and ongoing support for all my AI agent solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">AI Agent Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Custom AI automation solutions designed to streamline your business processes and boost productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Custom AI Chatbots</h3>
                <p className="text-gray-600">
                  Intelligent conversational agents that handle customer support, lead qualification, and user engagement 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Process Automation</h3>
                <p className="text-gray-600">
                  Streamline repetitive tasks, data processing, and workflow management with intelligent automation systems
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Email & Communication</h3>
                <p className="text-gray-600">
                  AI-powered email management, automated responses, and intelligent communication routing systems
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Voice AI Solutions</h3>
                <p className="text-gray-600">
                  Voice-enabled AI assistants for hands-free interaction, voice commands, and audio processing
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-red-200 transition-colors">
                  <Bot className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Analysis AI</h3>
                <p className="text-gray-600">
                  Intelligent data processing, pattern recognition, and automated reporting systems for business insights
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-indigo-200 transition-colors">
                  <MessageCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Integration Services</h3>
                <p className="text-gray-600">
                  Seamless integration of AI agents with existing systems, APIs, and business tools
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Get Started Today</h2>
              <p className="text-xl text-gray-600">
                Ready to automate your business with custom AI agents? Let's discuss your project.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose My AI Agent Services?</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Fast Delivery:</strong> Most projects completed within 1-2 weeks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Custom Solutions:</strong> Tailored to your specific business needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Ongoing Support:</strong> Maintenance and updates included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Fair Pricing:</strong> Transparent, competitive rates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Proven Results:</strong> Real automation that saves time and money</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Direct Contact</h4>
                  <p className="text-gray-700 mb-4">
                    For immediate consultation or urgent projects, reach out directly:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-600 mr-3" />
                      <a href="mailto:aiagent@dr.com" className="text-blue-600 hover:text-blue-800 font-medium">
                        aiagent@dr.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Start Your AI Project</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Description
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full"
                        placeholder="Describe your AI automation needs, current challenges, and desired outcomes..."
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Project Details
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Sakis Athan - AI Agent Engineer</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Building intelligent automation solutions that transform how businesses operate. 
              Custom AI agents designed for real-world impact.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:aiagent@dr.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
            <div className="border-t border-gray-800 pt-8 mt-8">
              <p className="text-gray-400 text-sm">
                © 2024 Sakis Athan. All rights reserved. | AI Agent Engineer & Automation Specialist
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setChatOpen(!chatOpen)}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
        >
          {chatOpen ? (
            <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
          ) : (
            <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
          )}
        </Button>
      </div>

      {/* Chat Interface */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-sm text-blue-100">Ask me about AI automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2"
                title={voiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => setChatOpen(false)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  Hi! I'm Sakis's AI assistant. Ask me about AI automation services, pricing, or any questions you have!
                </p>
              </div>
            )}
            
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl chat-message ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about AI automation..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Large Robot Animation */}
      <div className="fixed bottom-0 left-0 pointer-events-none z-10">
        <img
          src={largeRobot}
          alt="AI Robot"
          className="w-32 h-32 opacity-20"
        />
      </div>
    </div>
  )
}

export default App

