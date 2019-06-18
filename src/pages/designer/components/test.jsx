
                let p1 = new Vector2(0, 0);
                let p2 = new Vector2(imgCanvasWidth, 0);
                let p3 = new Vector2(0, imgCanvasHeight);
                let p4 = new Vector2(imgCanvasWidth, imgCanvasHeight);
                let minP = new Vector2(Infinity, Infinity);
                let maxP = new Vector2(-Infinity, -Infinity);
                
                let originMatrix = new Matrix3();
                let finalMatrix = new Matrix3();
    
                // 额外canvas处理单个元素方案, bingo!
                imgContext.clearRect(0, 0, imgCanvasWidth, imgCanvasHeight);
                imgContext.save();
    
                // 计算变化矩阵，原点--平移-->中心点; 旋转; 缩放; 中心点--平移-->原点。canvas变换矩阵是左乘矩阵！
                // imgContext.translate(halfImgCanvasWidth, halfImgCanvasHeight);
                // imgContext.rotate(config.rotate);
                // imgContext.scale(0.5, 0.5);
                // imgContext.translate(-halfImgCanvasWidth, -halfImgCanvasHeight);
                originMatrix.set(
                    1, 0, 0,
                    0, 1, 0,
                    -halfImgCanvasWidth, -halfImgCanvasHeight, 1,
                );
                finalMatrix = originMatrix.clone();
                
                originMatrix.set(
                    0.5, 0, 0,
                    0, 0.5, 0,
                    0, 0, 1,
                );
                finalMatrix.multiply(originMatrix);
                
                originMatrix.set(
                    Math.cos(config.rotate), Math.sin(config.rotate), 0,
                    -Math.sin(config.rotate), Math.cos(config.rotate), 0,
                    0, 0, 1,
                );
                finalMatrix.multiply(originMatrix);
    
                originMatrix.set(
                    1, 0, 0,
                    0, 1, 0,
                    halfImgCanvasWidth, halfImgCanvasHeight, 1,
                );
                finalMatrix.multiply(originMatrix);
                
                imgContext.transform(
                    finalMatrix.elements[0], finalMatrix.elements[3], 
                    finalMatrix.elements[1], finalMatrix.elements[4], 
                    finalMatrix.elements[2], finalMatrix.elements[5]
                );
                // 计算裁剪边缘
                finalMatrix.transpose()
                p1.applyMatrix3(finalMatrix);
                p2.applyMatrix3(finalMatrix);
                p3.applyMatrix3(finalMatrix);
                p4.applyMatrix3(finalMatrix);
                minP.x = Math.min(minP.x, p1.x);
                minP.x = Math.min(minP.x, p2.x);
                minP.x = Math.min(minP.x, p3.x);
                minP.x = Math.min(minP.x, p4.x);
                minP.y = Math.min(minP.y, p1.y);
                minP.y = Math.min(minP.y, p2.y);
                minP.y = Math.min(minP.y, p3.y);
                minP.y = Math.min(minP.y, p4.y);
    
                maxP.x = Math.max(maxP.x, p1.x);
                maxP.x = Math.max(maxP.x, p2.x);
                maxP.x = Math.max(maxP.x, p3.x);
                maxP.x = Math.max(maxP.x, p4.x);
                maxP.y = Math.max(maxP.y, p1.y);
                maxP.y = Math.max(maxP.y, p2.y);
                maxP.y = Math.max(maxP.y, p3.y);
                maxP.y = Math.max(maxP.y, p4.y);
                console.log(minP)
                console.log(maxP)
                console.log(p1.distanceTo(p2))
                
    
                imgContext.drawImage(
                    imgObj.img, 
                    0, 0,
                    imgCanvasWidth, imgCanvasHeight
                );
                
                imgContext.setTransform(1, 0, 0, 1, 0, 0);
                renderContext.drawImage(
                    imgCanvas, 
                    minP.x, minP.y,
                    maxP.x - minP.x, maxP.y - minP.y,
                    config.destinationPoints[0], config.destinationPoints[1], 
                    config.width, config.height
                );
                imgContext.restore();