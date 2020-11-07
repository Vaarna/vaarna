import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as targets from "@aws-cdk/aws-route53-targets";

export interface InfraStackProps extends cdk.StackProps {
  hostedZoneId: string;
  zoneName: string;
  repository: ecr.Repository;
  imageTag: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const fqdn = `gm-screen.${props.zoneName}`;

    // S3

    const imageBucket = new s3.Bucket(this, "ImageBucket", {
      cors: [
        {
          allowedMethods: [s3.HttpMethods.HEAD, s3.HttpMethods.GET],
          allowedOrigins: [`https://${fqdn}`],
          allowedHeaders: ["*"],
          maxAge: 3600,
        },
      ],
      publicReadAccess: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    // VPC

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 0,
      subnetConfiguration: [
        { cidrMask: 23, name: "Public", subnetType: ec2.SubnetType.PUBLIC },
        { cidrMask: 23, name: "Isolated", subnetType: ec2.SubnetType.ISOLATED },
      ],
    });

    // Cluster

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
      containerInsights: true,
    });

    // DNS and Certificates

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.zoneName,
      }
    );

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: fqdn,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    // LoadBalancer

    const loadBalancer = new elbv2.ApplicationLoadBalancer(
      this,
      "ApplicationLoadBalancer",
      {
        vpc,
        internetFacing: true,
        // TODO: uncomment once ec2.Vpc supports IPv6 networking
        // ipAddressType: elbv2.IpAddressType.DUAL_STACK,
      }
    );

    const httpListener = loadBalancer.addListener("HttpListener", {
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      open: true,
    });
    httpListener.addAction("HttpToHttpsRedirect", {
      action: elbv2.ListenerAction.redirect({
        permanent: true,
        protocol: "HTTPS",
        port: "443",
      }),
    });

    const listener = loadBalancer.addListener("Listener", {
      protocol: elbv2.ApplicationProtocol.HTTPS,
      port: 443,
      open: true,
    });
    listener.addCertificates("Certificates", [certificate]);

    const targetGroup = listener.addTargets("Targets", { port: 80 });

    const aRecord = new route53.ARecord(this, "ARecord", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(loadBalancer)
      ),
      recordName: fqdn,
    });

    // TODO: ec2.Vpc does not support IPv6 yet, once support for that is added this can be enabled
    // const aaaaRecord = new route53.AaaaRecord(this, "AaaaRecord", {
    //   zone,
    //   target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(loadBalancer)),
    //   recordName: fqdn,
    // })

    // Service

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 256,
        memoryLimitMiB: 512,
      }
    );
    imageBucket.grantReadWrite(taskDefinition.taskRole);

    const container = taskDefinition.addContainer("web", {
      image: ecs.ContainerImage.fromEcrRepository(
        props.repository,
        props.imageTag
      ),
      environment: {
        IMAGE_BUCKET: imageBucket.bucketName,
      },
    });
    container.addPortMappings({ containerPort: 80 });

    const service = new ecs.FargateService(this, "Service", {
      cluster,
      taskDefinition,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
    });
    service.autoScaleTaskCount({ minCapacity: 1, maxCapacity: 3 });
    targetGroup.addTarget(service);
  }
}
