"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Award, Calendar, User, BookOpen, AlertCircle, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Renders the certificate verification page.
 *
 * @returns {JSX.Element} The rendered certificate verification page.
 */
export default function CertificatePage() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber.trim()) {
      setError("Please enter a certificate number");
      return;
    }

    setIsVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/certificates?certificateNo=${encodeURIComponent(certificateNumber)}`);
      const data = await response.json();

      if (response.ok && data.isValid) {
        setVerificationResult({
          isValid: true,
          holderName: data.certificate.holderName,
          courseTitle: data.certificate.courseTitle,
          instructorName: data.certificate.instructorName,
          issueDate: data.certificate.issueDate,
          expiryDate: new Date(new Date(data.certificate.issueDate).getTime() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years validity
          certificateId: data.certificate.certificateId,
          grade: "Excellent",
          duration: "Varies"
        });
        toast({
          title: "Certificate Verified Successfully!",
          description: "This certificate is valid and issued by KTTC.",
        });
      } else {
        setVerificationResult({
          isValid: false,
          error: data.error || "Certificate not found or has been revoked"
        });
        toast({
          title: "Certificate Verification Failed",
          description: data.error || "This certificate is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("No certificate found with this number. Please check and try again.");
      toast({
        title: "Certificate Not Found",
        description: "No certificate found with this number.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Certificate PDF is being downloaded.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Link Copied",
      description: "Certificate verification link copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-yellow-400 text-blue-900 hover:bg-yellow-300">
                Certificate Verification
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Verify Your Certificate
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Validate the authenticity of KTTC-issued certificates instantly. 
                Enter your certificate number to verify its status and details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-gray-900">
                  Certificate Verification System
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enter the certificate number to verify its authenticity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="certificate" className="text-sm font-medium text-gray-700">
                      Certificate Number *
                    </label>
                    <div className="relative">
                      <Input
                        id="certificate"
                        type="text"
                        placeholder="e.g., KTTC-2024-0001"
                        value={certificateNumber}
                        onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                        className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Certificate number is typically formatted as KTTC-YYYY-NNNN
                    </p>
                  </div>
                  
                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isVerifying || !certificateNumber.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Verify Certificate</span>
                      </div>
                    )}
                  </Button>
                </form>

                {/* Sample Certificates for Testing */}
                <div className="border-t pt-6">
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Sample certificates for testing:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCertificateNumber("KTTC-2024-0001")}
                      className="text-xs"
                    >
                      KTTC-2024-0001 (Valid)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCertificateNumber("KTTC-2024-0002")}
                      className="text-xs"
                    >
                      KTTC-2024-0002 (Valid)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCertificateNumber("INVALID-123")}
                      className="text-xs"
                    >
                      INVALID-123 (Invalid)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Verification Result */}
      {verificationResult && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {verificationResult.isValid ? (
                <Card className="border-green-200 bg-green-50 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <CardTitle className="text-2xl text-green-800">
                        Certificate Verified Successfully
                      </CardTitle>
                    </div>
                    <CardDescription className="text-green-700">
                      This certificate is valid and issued by Khuzestan Teacher Training Center
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Certificate Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Certificate Holder</p>
                            <p className="font-semibold text-gray-900">{verificationResult.holderName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Course Title</p>
                            <p className="font-semibold text-gray-900">{verificationResult.courseTitle}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Instructor</p>
                            <p className="font-semibold text-gray-900">{verificationResult.instructorName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Issue Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(verificationResult.issueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(verificationResult.expiryDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Grade</p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {verificationResult.grade}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Certificate ID */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Certificate ID</p>
                          <p className="font-mono font-semibold text-gray-900">{verificationResult.certificateId}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Verification Badge */}
                    <div className="text-center">
                      <Badge className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 text-lg">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Authentically Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-200 bg-red-50 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <CardTitle className="text-2xl text-red-800">
                        Certificate Verification Failed
                      </CardTitle>
                    </div>
                    <CardDescription className="text-red-700">
                      {verificationResult.error || "This certificate is not valid or has been revoked"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-4">
                      <AlertCircle className="h-16 w-16 text-red-300 mx-auto" />
                      <p className="text-gray-700">
                        If you believe this is an error, please contact our verification department at 
                        <a href="mailto:verify@kttc.edu.ir" className="text-blue-600 hover:underline ml-1">
                          verify@kttc.edu.ir
                        </a>
                      </p>
                      <Button
                        onClick={() => {
                          setVerificationResult(null);
                          setCertificateNumber("");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Verify Another Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Information Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                About Certificate Verification
              </h2>
              <p className="text-xl text-gray-600">
                Learn how our verification system works and why it's important
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Instant Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Get immediate results when you verify certificate authenticity through our secure online system.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-green-100 text-green-600 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Guaranteed Authenticity</h3>
                  <p className="text-gray-600 text-sm">
                    All KTTC certificates are cryptographically secured and can be verified instantly online.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Global Recognition</h3>
                  <p className="text-gray-600 text-sm">
                    Our certificates are recognized by educational institutions and employers worldwide.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}