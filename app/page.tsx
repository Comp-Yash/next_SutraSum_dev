"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Upload,
  FileText,
  Globe,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  Zap,
  Brain,
  Languages,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const languageMap = {
  Hindi: "hi",
  Marathi: "mr",
  Gujarati: "gu",
  Tamil: "ta",
  Telugu: "te",
  Kannada: "kn",
  Punjabi: "pa",
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [translatedSummary, setTranslatedSummary] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (uploadedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      if (validTypes.includes(uploadedFile.type)) {
        setFile(uploadedFile)
        setError("")
        toast({
          title: "File uploaded successfully",
          description: `${uploadedFile.name} is ready for processing.`,
        })
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file.",
          variant: "destructive",
        })
      }
    }
  }

  const processFile = async () => {
    if (!file || !selectedLanguage) {
      toast({
        title: "Missing requirements",
        description: "Please upload a file and select a language.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setSummary("")
    setTranslatedSummary("")
    setError("")

    try {
      // Step 1: Extract text and summarize
      setCurrentStep("Extracting text and generating summary...")
      const formData = new FormData()
      formData.append("file", file)

      const summaryResponse = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      })

      const summaryData = await summaryResponse.json()

      if (!summaryResponse.ok) {
        throw new Error(summaryData.error || "Failed to generate summary")
      }

      setSummary(summaryData.summary)

      // Step 2: Translate summary
      setCurrentStep(`Translating to ${selectedLanguage}...`)
      const translateResponse = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: summaryData.summary,
          targetLanguage: languageMap[selectedLanguage as keyof typeof languageMap],
        }),
      })

      const translateData = await translateResponse.json()

      if (!translateResponse.ok) {
        // If translation fails, still show the summary
        console.warn("Translation failed:", translateData.error)
        setTranslatedSummary("Translation service temporarily unavailable. Please try again later.")
      } else {
        setTranslatedSummary(translateData.translation)
      }

      toast({
        title: "Processing complete!",
        description: "Your document has been summarized and translated.",
      })
    } catch (error) {
      console.error("Processing error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setCurrentStep("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 p-6 backdrop-blur-sm border-b border-slate-800/50"
      >
        <div className="container mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-blue-400" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              SutraSum AI
            </h1>
          </motion.div>
          <nav className="hidden md:flex space-x-6">
            {["Home", "Features", "About", "Contact"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors relative"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <motion.h2
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              AI-Powered
              <motion.span
                className="bg-gradient-to-r from-blue-400 via-cyan-400 to-slate-300 bg-clip-text text-transparent block"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              >
                Document
              </motion.span>
              Summarization
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Transform your documents into concise summaries in multiple regional languages. Powered by advanced AI
              technology for accurate and contextual understanding.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center space-x-4 mb-12"
          >
            {[
              { icon: FileText, text: "PDF, DOCX, TXT", color: "text-blue-400" },
              { icon: Globe, text: "7+ Languages", color: "text-cyan-400" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2 bg-slate-800/30 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-white font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h3
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              How It Works
            </motion.h3>
            <motion.p
              className="text-lg text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Experience the future of document processing with our intelligent 3-step workflow
            </motion.p>
          </motion.div>

          <div className="relative max-w-6xl mx-auto">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent transform -translate-y-1/2"></div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  step: "01",
                  title: "Upload Document",
                  description:
                    "Drag & drop or select your PDF, DOCX, or TXT file. Our AI instantly analyzes the content structure.",
                  icon: Upload,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "bg-blue-500/10",
                  borderColor: "border-blue-500/30",
                },
                {
                  step: "02",
                  title: "Select Language",
                  description:
                    "Choose from 7+ regional languages. Our neural networks prepare for contextual translation.",
                  icon: Languages,
                  color: "from-cyan-500 to-teal-500",
                  bgColor: "bg-cyan-500/10",
                  borderColor: "border-cyan-500/30",
                },
                {
                  step: "03",
                  title: "Get AI Summary",
                  description:
                    "Receive intelligent summaries in seconds. Advanced AI ensures accuracy and context preservation.",
                  icon: Brain,
                  color: "from-teal-500 to-emerald-500",
                  bgColor: "bg-teal-500/10",
                  borderColor: "border-teal-500/30",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <motion.div
                    className={`relative p-8 rounded-2xl ${item.bgColor} backdrop-blur-sm border ${item.borderColor} group hover:scale-105 transition-all duration-300`}
                    whileHover={{ y: -10 }}
                  >
                    {/* Step Number */}
                    <motion.div
                      className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {item.step}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className="mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${item.color} p-4 mx-auto`}>
                        <item.icon className="w-full h-full text-white" />
                      </div>
                    </motion.div>

                    {/* Content */}
                    <motion.h4
                      className="text-2xl font-bold text-white mb-4 text-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                    >
                      {item.title}
                    </motion.h4>
                    <motion.p
                      className="text-gray-300 text-center leading-relaxed"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.4 }}
                    >
                      {item.description}
                    </motion.p>

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />

                    {/* Arrow for desktop */}
                    {index < 2 && (
                      <motion.div
                        className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.6 }}
                      >
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <ArrowRight className="w-6 h-6 text-blue-400" />
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-center mt-12"
            >
              <motion.div
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Lightning Fast Processing</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Processing Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Upload & Process Your Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="file-upload" className="text-white">
                    Choose File (PDF, DOCX, or TXT - Max 10MB)
                  </Label>
                  <div className="relative">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="bg-slate-700/50 border-slate-600/50 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:bg-slate-700/70 transition-all duration-300"
                    />
                    <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {file && (
                    <motion.div
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <p className="text-sm text-green-400">✓ {file.name} uploaded</p>
                      <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Language Selection */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Label className="text-white">Target Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-700/70 transition-all duration-300">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.keys(languageMap).map((lang) => (
                        <SelectItem key={lang} value={lang} className="text-white hover:bg-slate-700">
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Important Note */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Alert className="bg-blue-500/10 border-blue-500/30 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      <strong>Note:</strong> For best results with PDF files, ensure they contain selectable text (not
                      scanned images). If processing fails, try converting your document to TXT format first.
                    </AlertDescription>
                  </Alert>
                </motion.div>

                {/* Process Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={processFile}
                    disabled={!file || !selectedLanguage || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        <span>{currentStep}</span>
                      </div>
                    ) : (
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Process Document
                      </motion.span>
                    )}
                  </Button>
                </motion.div>

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Alert className="bg-red-500/10 border-red-500/30">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Results */}
                {/* Enhanced Results Section - Side by Side */}
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                  >
                    {/* Results Header */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center mb-8"
                    >
                      <h3 className="text-3xl font-bold text-white mb-3">Processing Complete!</h3>
                      <p className="text-lg text-gray-300">
                        Your document has been successfully analyzed and summarized
                      </p>
                      <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mt-4 rounded-full"></div>
                    </motion.div>

                    {/* Side by Side Summaries */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                      {/* English Summary */}
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">English Summary</h4>
                            <p className="text-sm text-gray-400">Original AI-generated summary</p>
                          </div>
                        </div>
                        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-slate-600/40 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                          <CardContent className="p-0">
                            <Textarea
                              value={summary}
                              readOnly
                              className="bg-transparent border-none text-white text-lg leading-relaxed min-h-[300px] p-6 resize-none focus:ring-0 focus:outline-none"
                              style={{
                                fontSize: "18px",
                                lineHeight: "1.7",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                              }}
                            />
                          </CardContent>
                        </Card>
                        <div className="flex items-center justify-between text-sm text-gray-400 px-2">
                          <span>{summary.split(" ").length} words</span>
                          <span>{summary.length} characters</span>
                        </div>
                      </motion.div>

                      {/* Translated Summary */}
                      {translatedSummary && (
                        <motion.div
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                              <Languages className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white">{selectedLanguage} Translation</h4>
                              <p className="text-sm text-gray-400">AI-translated summary</p>
                            </div>
                          </div>
                          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-slate-600/40 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
                            <CardContent className="p-0">
                              <Textarea
                                value={translatedSummary}
                                readOnly
                                className="bg-transparent border-none text-white text-lg leading-relaxed min-h-[300px] p-6 resize-none focus:ring-0 focus:outline-none"
                                style={{
                                  fontSize: "18px",
                                  lineHeight: "1.7",
                                  fontFamily: "system-ui, -apple-system, sans-serif",
                                }}
                              />
                            </CardContent>
                          </Card>
                          <div className="flex items-center justify-between text-sm text-gray-400 px-2">
                            <span>{translatedSummary.split(" ").length} words</span>
                            <span>{translatedSummary.length} characters</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col sm:flex-row gap-4 mb-8 justify-center"
                    >
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(summary)
                          toast({
                            title: "Copied!",
                            description: "English summary copied to clipboard",
                          })
                        }}
                        variant="outline"
                        className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-blue-500/50 transition-all duration-300 px-6 py-3"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Copy English Summary
                      </Button>
                      {translatedSummary && (
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(translatedSummary)
                            toast({
                              title: "Copied!",
                              description: `${selectedLanguage} translation copied to clipboard`,
                            })
                          }}
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 px-6 py-3"
                        >
                          <Languages className="w-4 h-4 mr-2" />
                          Copy {selectedLanguage} Translation
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setFile(null)
                          setSummary("")
                          setTranslatedSummary("")
                          setSelectedLanguage("")
                          toast({
                            title: "Reset Complete",
                            description: "Ready to process another document",
                          })
                        }}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all duration-300 px-6 py-3 shadow-lg hover:shadow-xl"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Process Another Document
                      </Button>
                    </motion.div>

                    {/* Enhanced Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <div className="text-center p-6 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{summary.split(" ").length}</div>
                        <div className="text-sm text-gray-400 font-medium">Words in Summary</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                        <div className="text-3xl font-bold text-cyan-400 mb-2">
                          {Math.ceil(summary.split(" ").length / 200)}
                        </div>
                        <div className="text-sm text-gray-400 font-medium">Minutes to Read</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300">
                        <div className="text-3xl font-bold text-teal-400 mb-2">{selectedLanguage}</div>
                        <div className="text-sm text-gray-400 font-medium">Target Language</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300">
                        <div className="text-3xl font-bold text-green-400 mb-2">✓</div>
                        <div className="text-sm text-gray-400 font-medium">Processing Complete</div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h3 className="text-4xl font-bold text-white mb-6">About SutraSum AI</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're revolutionizing document processing with cutting-edge AI technology, making information accessible
              across language barriers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Advanced Gemini AI technology for accurate summarization and understanding.",
                color: "text-blue-400",
              },
              {
                icon: Globe,
                title: "Multilingual",
                description: "Support for 7+ regional languages including Hindi, Tamil, Telugu, and more.",
                color: "text-cyan-400",
              },
              {
                icon: FileText,
                title: "Multiple Formats",
                description: "Process PDF, DOCX, and TXT files with intelligent text extraction.",
                color: "text-teal-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 h-full hover:border-slate-600/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color} mx-auto`} />
                    </motion.div>
                    <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h3 className="text-4xl font-bold text-white mb-6">Get In Touch</h3>
            <p className="text-xl text-gray-300">Have questions or need support? We'd love to hear from you.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Mail, text: "support@sutrasum.ai", color: "text-blue-400" },
                    { icon: Phone, text: "+1 (555) 123-4567", color: "text-cyan-400" },
                    { icon: MapPin, text: "San Francisco, CA", color: "text-teal-400" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <span className="text-gray-300">{item.text}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Send Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 hover:bg-slate-700/70 transition-all duration-300"
                  />
                  <Input
                    placeholder="Your Email"
                    type="email"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 hover:bg-slate-700/70 transition-all duration-300"
                  />
                  <Textarea
                    placeholder="Your Message"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 min-h-[100px] resize-none hover:bg-slate-700/70 transition-all duration-300"
                  />
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 py-8 px-6 border-t border-slate-800/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto text-center">
          <p className="text-gray-400">© 2024 SutraSum AI. All rights reserved. Powered by advanced AI technology.</p>
        </div>
      </motion.footer>
    </div>
  )
}
